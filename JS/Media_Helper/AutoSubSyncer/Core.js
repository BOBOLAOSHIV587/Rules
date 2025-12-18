import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import { stringSimilarity } from "string-similarity-js"
// some vtt download may cause exception if we use `fetch` or `got` library.
// the error is like `Z_DATA_ERROR incorrect header check`
// use `isomorphic-fetch` instead
import fetch from 'isomorphic-fetch'

const CORE_VERSION = 'v1.3'
const SCRIPT_NAME = 'AutoSubSyncer'

const DATA_DIR = 'data'
const CONF_DIR = 'config'
const LOG_DIR = 'log'
const VTT_DIR = 'vtt'
const FN_MAIN_LOG = 'main.log'
const FN_SUB_SYNCER_DB = 'sub_syncer.db'

// 此参数为每条ass字幕在vtt字幕中向前搜索的最大条目数
// 考虑到很多字幕组不翻译歌词，此参数值不宜过小
// 比如某视频中有一段歌词在vtt字幕中占据了20条，但ass字幕中没翻译，
// 那么此时若将此参数值设置成低于20，则最终的匹配结果将惨不忍睹
// 此参数对应sub_syncer.conf中的subsyncer.search.forward
const SEARCH_FORWARD_MAX = 35

// 允许跨行匹配时两行之间的最大时间戳差值(offset)
// 一般来说当两行字幕的时间戳相距太大时不太可能是连续的一句话
// 此参数对应sub_syncer.conf中的subsyncer.match.multiline.offset
const MATCH_MULTI_LINE_MAX_OFFSET = 5 // 秒

// 此参数为启用时间轴差值(offset)预警机制的最大整句长度
// 当整句长度大于此值时，无论offset多大都认为匹配有效
// 当设置为0时代表禁用此预警机制
// 此参数对应sub_syncer.conf中的subsyncer.alert.offset.words.max
// 应与下面的MATCH_OFFSET_MAX一起使用
const MATCH_OFFSET_ALERT_MAX_WORDS = 2

// 此参数为每个有效匹配所允许的ass和vtt之间的最大时间戳差值(offset)
// 只有在整句长度<=MATCH_OFFSET_ALERT_MAX_WORDS才会生效
// 同上面的SEARCH_FORWARD_MAX参数一样，也需要考虑歌词不翻译的问题
// 一般来说若某个匹配的offset过大(比如大于60秒)，很有可能代表匹配出现问题了
// 当然也不排除是ass中有上集预告而vtt中没有的这种特殊情况
// 此参数对应sub_syncer.conf中的subsyncer.alert.offset.max
const MATCH_OFFSET_MAX = 30 // 秒

// 如果两个句子不同单词数的比例 <= 此参数值，我们也粗略认为这两句相同
// 此参数结合下面的MATCH_SAME_TOLERANT_MIN_WORDS一起使用，可以消除一些语气助词拼写差异造成的匹配失败
// 设置为0.1的意思是允许10个单词中有1个不同
// 此参数值不建议大于0.2，否则很可能出现匹配错乱
// 如果只想精准匹配，可将此值设置为0
// 应与下面的MATCH_SAME_TOLERANT_MIN_WORDS一起使用
// 此参数对应sub_syncer.conf中的subsyncer.same.tolerant.ratio
const MATCH_SAME_TOLERANT_RATIO = 0.1

// 只有当整句长度大于此参数值时，才会允许有一定比例的不同单词数存在
// 此参数值不建议小于10，否则很可能出现匹配错乱
// 如果只想精准匹配，可将此值设置的尽可能大
// 此参数对应sub_syncer.conf中的subsyncer.same.tolerance.words.min
const MATCH_SAME_TOLERANT_MIN_WORDS = 10

// 文件匹配率低于此值一般是有问题了，建议修改上面的关键参数后再重试
const LOW_MATCH_RATE = 0.8

const MATCH_TYPE_NO_MATCH = 0 // vtt和ass未匹配
const MATCH_TYPE_ALL_SAME = 1 // vtt和ass相同
const MATCH_TYPE_VTT_MULTI_SAME = 2 // vtt双行和ass相同
const MATCH_TYPE_ASS_MULTI_SAME = 3 // ass双行和vtt相同
const MATCH_TYPE_BOTH_MULTI_SAME = 4 // ass双行和vtt双行相同
const MATCH_TYPE_SIMILAR = 5 // vtt和ass前半部分相同（精准匹配 或 允许有一字偏差）

const SIMILAR_MIN_WORDS = 6 // 从索引0开始的连续相同单词数，>= 此值将被视为整句相似
const SIMILAR_MIN_WORDS_TOLERANT = 7 // 同上面的SIMILAR_MIN_WORDS，但允许有一个单词不同
const SAME_MIN_LENGTH_TOLERANT = 5 // 如果整句长度 >= 此值，且只有一个单词不同，则也认定为整句相同

const __PRINT_SEPARATOR__ = '--------------------------------------------'
const __PRINT_SEPARATOR_EX__ = '--------------------------------------------\n\n'

export class Core {
    constructor(vtt_provider) {
        this.vtt_provider = vtt_provider

        this.main_log = ''
        this.sub_log = ''
    }

    async match() {
        const series_name = this.getConfig('subsyncer.series')
        if (!series_name) {
            this.log('sub_syncer.conf中未配置subsyncer.series参数')
            return
        }

        if (!this.exists(`${DATA_DIR}/${series_name}`)) {
            this.log(`${DATA_DIR}/${series_name} 目录不存在，请先创建并放入ass字幕文件`)
            return
        }

        const root = this.readSyncerDB(series_name)
        if (!root) {
            this.log(`播放历史数据库读取失败，路径: ${series_name}/sub_syncer.db`)
            this.log('请先参考官方文档生成数据库文件，然后在电脑上进行iCloud云同步')
            return
        }
        const platform = root.platform
        if (!platform) {
            this.log('数据库文件缺少platform字段')
            return
        }

        // check multi config files
        const configs = []
        if (this.getConfigInt('subsyncer.match.mode', 1) == 1) {
            // support up to 5 configs (including the default one)
            for (const i in [0, 1, 2, 3, 4]) {
                const config = this.readMultiConfig(i)
                if (!config) {
                    break
                }
                configs.push(config)
            }
            if (configs.length > 1) {
                this.logMain(`多配置模式已开启，共发现 ${configs.length} 个配置文件`)
            }
        }
        else {
            configs.push(this.readMultiConfig(0))
        }

        const match_rates = {}
        let manifests = root['manifests']
        const specificEpInfo = this.getConfig('subsyncer.episode')
        if (specificEpInfo && !manifests[specificEpInfo]) {
            this.log(`数据库文件中没有 ${specificEpInfo} 的信息`)
            return
        }

        for (const epInfo in manifests) {
            if (specificEpInfo && epInfo != specificEpInfo) {
                continue
            }

            if (!this.getConfigBool('subsyncer.override', false) && this.exists(this.getSrtPath(series_name, epInfo))) {
                this.logMain(`${epInfo}.srt已存在，跳过...`)
                continue
            }

            const assPath = await this.getAssPath(series_name, epInfo)
            if (!this.exists(assPath)) {
                this.logMain(`${series_name}/${epInfo}.ass不存在，跳过...`)
                continue
            }

            let vttBody
            const vttPath = this.getVttPath(series_name, epInfo)
            if (!this.getConfigBool('subsyncer.vtt.redownload', true) && this.exists(vttPath)) {
                this.logMain('vtt文件已存在，跳过下载...')
                vttBody = this.readFile(vttPath)
            }
            else {
                // get vtt content from provider
                this.log(`[${series_name}] [${epInfo}] 正在下载vtt字幕...`)
                vttBody = await this.vtt_provider(platform, manifests[epInfo])
                if (!vttBody) {
                    this.log('vtt字幕下载失败...')
                    continue
                }
                // write to file for later use
                this.writeFile(vttPath, vttBody)
            }

            this.logMain(__PRINT_SEPARATOR_EX__)

            // create vtt object
            const vtt = this.readVTT(vttBody)
            // check file
            if (!vtt.length) {
                this.log('vtt字幕文件读取错误，可能是下载出错了，请重试或联系本工具作者！')
                return
            }

            // read ass file
            // auto detect file encoding
            const { default: languageEncoding } = await import('detect-file-encoding-and-language')
            const info = await languageEncoding(path.join(this.getRootPath(), assPath))
            const encoding = info.encoding
            this.log(`检测到ass文件编码为 ${encoding}\n`)
            let assBody = this.readFile(assPath, encoding)

            // 有些ASS文件的中文和英文并不在同一行，而是整个文件上半部分是中文，下半部分是英文
            // 这种情况需要先预处理成标准的格式（即中英文在同一个Dialogue中）
            if (this.getConfigBool('subsyncer.ass.repair', false)) {
                assBody = this.repairASS(assBody)
            }

            // create ass object
            const ass = this.readASS(assBody)
            if (!ass.length) {
                this.log('ass字幕文件读取错误，请确认文件编码为utf-8')
                return
            }

            this.logMain(`########## [${epInfo}] 字幕匹配开始 ##########\n`)

            // let's match
            const results = []
            let max_index = 0
            let max_match_rate = 0
            configs.forEach((config, i) => {
                if (configs.length > 1) {
                    this.logMain(`=========== 正在进行第 ${i} 轮匹配`)
                }

                const result = this.doMatch(this.deepCopy(vtt), this.deepCopy(ass), config)
                results.push(result)

                if (result.match_rate > max_match_rate) {
                    max_match_rate = result.match_rate
                    max_index = i
                }

                if (configs.length > 1) {
                    this.logMain(`=========== 匹配率: ${this.getPercentage(result.match_rate)}\n`)
                } 
            })

            const max_result = results[max_index]
            if (configs.length > 1) {
                this.logMain(`########## 最高匹配率来自第 ${max_index + 1} 轮: ${this.getPercentage(max_result.match_rate)}\n`)
            }

            match_rates[epInfo] = {
                max: max_result.match_rate,
                max_index: max_index,
                all: results.map(r => r.match_rate)
            }

            // print some important info
            this.logMain(`### ${max_result.invalid_end_ts_cnt} invalid end timestamps\n`)
            if (max_result.heading_del_cnt) {
                this.logMain(`### safely removed ${max_result.heading_del_cnt} trash leading subs\n`)
            }
            if (max_result.tail_del_cnt) {
                this.logMain(`### safely removed ${max_result.tail_del_cnt} trash trailing subs\n`)
            }

            // print match count by type
            for (const type of [1, 2, 3, 4, 5]) {
                const cnt = max_result.type_counts[type] || 0
                this.logMain(`### 【${this.getMatchResultDesc(type)}】 = ${cnt}, ratio = ${this.getPercentage(cnt, max_result.match_cnt)}`)
            }

            // match details
            this.logMain(`\n### max_vtt_jump = ${max_result.max_vtt_jump}, jump_vtt_idx = ${max_result.jump_vtt_idx}`)
            this.logMain(`### max_ass_jump = ${max_result.max_ass_jump}, jump_ass_idx = ${max_result.jump_ass_idx}`)
            this.logMain(`### first_matched_vtt = ${max_result.first_matched_vtt}, first_matched_ass = ${max_result.first_matched_ass}`)
            this.logMain(`### unmatched_tail_cnt = ${max_result.unmatched_tail_cnt}`)

            // match rate
            this.logMain(`### ass_sub_cnt = ${max_result.ass_sub_cnt}, vtt_sub_cnt = ${max_result.vtt_sub_cnt}`)
            this.logMain(`### match_cnt = ${max_result.match_cnt}, 【匹配率 = ${this.getPercentage(max_result.match_rate)}】`)
            this.logMain(`### max_offset = ${max_result.max_offset}, min_offset = ${max_result.min_offset}`)

            this.logMain(`\n########## [${epInfo}] 字幕匹配结束 ##########\n`)

            // construct sub log
            this.sub_log = ''

            // print critical params
            this.logMain(`@@@@@@ 最大向前搜索数 = ${max_result.config['subsyncer.search.forward']}`)
            this.logMain(`@@@@@@ 时间轴预警最大长度 = ${max_result.config['subsyncer.alert.offset.words.max']}个单词`)
            this.logMain(`@@@@@@ 最大允许时间轴偏移 = ${max_result.config['subsyncer.alert.offset.max']} 秒`)
            this.logMain(`@@@@@@ 最大允许差异比例 = ${max_result.config['subsyncer.same.tolerant.ratio']}`)
            this.logMain(`@@@@@@ 允许差异的最小长度 = ${max_result.config['subsyncer.same.tolerant.words.min']}个单词\n`)

            // append log content of the best match
            this.sub_log += max_result.sub_log

            // save sub log
            this.saveSubLog(series_name, epInfo)

            // finished! generate the new srt file from modified ass
            // insert watermark sub if necessary
            if (this.getConfigBool('subsyncer.watermark', true)) {
                max_result.ass.splice(0, 0, {
                    start: 0,
                    end: 5000,
                    content_en: '',
                    content_cn: `[${SCRIPT_NAME} ${CORE_VERSION}] ${this.getPercentage(max_result.match_rate)}`,
                    id: -1
                })
            }
            // save now
            this.saveSRT(max_result.ass, series_name, epInfo)

            this.logMain(__PRINT_SEPARATOR_EX__)

            // test
            // break
        }

        // print match_rate of all episodes
        this.logMain(`\n########## 以下为匹配率汇总 ##########`)
        let low_match_eps = []
        for (const epInfo in match_rates) {
            if (match_rates[epInfo].max < LOW_MATCH_RATE) {
                low_match_eps.push(epInfo)
            }

            if (configs.length > 1) {
                const rate_list = match_rates[epInfo].all.map(m => this.getPercentage(m))
                this.logMain(`${epInfo}   ${match_rates[epInfo].max_index}   ${this.getPercentage(match_rates[epInfo].max)}   [${rate_list.join(', ')}]`)
            }
            else {
                this.logMain(`${epInfo}   ${this.getPercentage(match_rates[epInfo].max)}`)
            }
        }

        if (low_match_eps.length) {
            this.logMain(__PRINT_SEPARATOR__)
            this.logMain(`${low_match_eps.length} 个文件的匹配率低于${LOW_MATCH_RATE * 100}%：${low_match_eps.join(', ')}`)
            this.logMain('建议查看相关日志，删除生成的srt文件\n然后参考github文档修改sub_syncer.conf中的关键参数后再重试')
        }

        this.logMain(__PRINT_SEPARATOR_EX__)

        // save main log
        this.saveMainLog(series_name)

        this.log(`########## 全部任务已结束，日志文件保存在 ${DATA_DIR}/${series_name}/${LOG_DIR} 目录 ##########`)
    }

    doMatch(vtt, ass, config) {
        // reset sub log
        this.sub_log = ''

        // this is the final result of this round
        const result = { vtt, ass, config }

        // match vtt subs with ass one by one
        const matches = this.compare(vtt, ass, config)

        if (!matches.length) {
            result.match_rate = 0
            return result
        }

        this.logSub('=========== 开始打印匹配结果 ===========\n')
        for (const match of matches) {
            this.printMatch(match)
        }
        this.logSub('=========== 匹配结果打印完毕 ===========\n')

        // modify ass with matches
        for (const match of matches) {
            const line = ass[match.index_ass]

            if (match.type == MATCH_TYPE_SIMILAR) {
                // similar - keep the duration of ass sub
                line.start += match.offset
                line.end += match.offset
            }
            else {
                // same - change to vtt's start & end
                line.start = match.start_vtt
                line.end = match.end_vtt
            }
        }

        // if the first vtt sub is matched,
        // we can safely delete the preceeding ass subs (usually credit & ad)
        const first_match = matches[0] 
        if (first_match.index_vtt == 0) {
            result.heading_del_cnt = first_match.index_ass
            ass.splice(0, first_match.index_ass)
        }
        else {
            result.heading_del_cnt = 0
        }

        const last_match = matches[matches.length - 1]
        result.tail_del_cnt = 0
        result.unmatched_tail_cnt = 0
        if (last_match.index_vtt == vtt.length - 1) {
            // if the last vtt sub is matched,
            // we can safely delete the succeeding ass subs
            const last_ass_idx = ass.findIndex(sub => sub.id == last_match.id_ass)
            if (ass.length - last_ass_idx > 1) {
                result.tail_del_cnt = ass.length - last_ass_idx - 1
                ass.splice(last_ass_idx + 1)
            }
        }
        else {
            // check unmatched tailing subs of ass
            if (last_match.id_ass < ass[ass.length - 1].id) {
                const last_ass_idx = ass.findIndex(sub => sub.id == last_match.id_ass)
                result.unmatched_tail_cnt = ass.length - last_ass_idx - 1
            }
        }

        // reorder ass subs after modification
        ass.sort((l, r) => l.start - r.start)

        // check invalid end timestamps - (end timestamp larger than start timestamp of next sub)
        this.logSub('=========== 开始打印非法时间戳 ===========\n')
        let sub_indices = []
        ass.forEach((sub, idx) => {
            if (idx > 0 && sub.start < ass[idx - 1].end) {
                sub_indices.push(idx - 1)

                this.logSub(__PRINT_SEPARATOR__)
                this.logSub(`${this.msToStr(ass[idx - 1].start)} => ${this.msToStr(ass[idx - 1].end)}`)
                this.logSub(`${ass[idx - 1].content_cn}\n${ass[idx - 1].content_en}`)
                this.logSub(__PRINT_SEPARATOR__)
                this.logSub(`${this.msToStr(sub.start)} => ${this.msToStr(sub.end)}`)
                this.logSub(`${sub.content_cn}\n${sub.content_en}`)
                this.logSub(__PRINT_SEPARATOR__)
                this.logSub(`<overflow = ${ass[idx - 1].end - sub.start}>`)
                this.logSub('\n')
            }
        })
        this.logSub('=========== 非法时间戳打印完毕 ===========\n')

        result.invalid_end_ts_cnt = sub_indices.length
        this.logSub(`### ${sub_indices.length} invalid end timestamps\n`)

        if (result.heading_del_cnt) {
            this.logSub(`### safely removed ${result.heading_del_cnt} trash leading subs\n`)
        }
        if (result.tail_del_cnt) {
            this.logSub(`### safely removed ${result.tail_del_cnt} trash trailing subs\n`)
        }

        // count match types
        const type_counts = {}
        for (const match of matches) {
            const cnt = (type_counts[match.type] || 0) + 1
            type_counts[match.type] = cnt
        }
        result.type_counts = type_counts

        // print match count by type
        for (const type of [1, 2, 3, 4, 5]) {
            const cnt = result.type_counts[type] || 0
            this.logSub(`### 【${this.getMatchResultDesc(type)}】 = ${cnt}, ratio = ${this.getPercentage(cnt, matches.length)}`)
        }

        // evaluate vtt index jumps
        result.max_vtt_jump = 0
        result.jump_vtt_idx = 0
        matches.forEach((match, idx) => {
            if (idx > 0 && match.index_vtt - matches[idx - 1].index_vtt > result.max_vtt_jump) {
                result.max_vtt_jump = match.index_vtt - matches[idx - 1].index_vtt
                result.jump_vtt_idx = match.index_vtt
            }
        })
        this.logSub(`\n### max_vtt_jump = ${result.max_vtt_jump}, jump_vtt_idx = ${result.jump_vtt_idx}`)

        // evaluate ass index jumps
        result.max_ass_jump = 0
        result.jump_ass_idx = 0
        matches.forEach((match, idx) => {
            if (idx > 0 && match.index_ass - matches[idx - 1].index_ass > result.max_ass_jump) {
                result.max_ass_jump = match.index_ass - matches[idx - 1].index_ass
                result.jump_ass_idx = match.index_ass
            }
        })
        this.logSub(`### max_ass_jump = ${result.max_ass_jump}, jump_ass_idx = ${result.jump_ass_idx}`)

        result.first_matched_vtt = matches[0].index_vtt
        result.first_matched_ass = matches[0].index_ass
        this.logSub(`### first_matched_vtt = ${result.first_matched_vtt}, first_matched_ass = ${result.first_matched_ass}`)
        this.logSub(`### unmatched_tail_cnt = ${result.unmatched_tail_cnt}`)

        // other important statistics
        result.ass_sub_cnt = ass.length
        result.vtt_sub_cnt = vtt.length
        this.logSub(`### ass_sub_cnt = ${ass.length}, vtt_sub_cnt = ${vtt.length}`)

        result.match_cnt = matches.length
        result.match_rate = matches.length * 1.0 / ass.length
        this.logSub(`### match_cnt = ${matches.length}, 【匹配率 = ${this.getPercentage(result.match_rate)}】`)

        const offsets = matches.map(d => Math.abs(d.offset))
        result.max_offset = Math.max(...offsets)
        result.min_offset = Math.min(...offsets)
        this.logSub(`### max_offset = ${result.max_offset}, min_offset = ${result.min_offset}`)

        result.sub_log = this.sub_log
        return result
    }

    compare(vtt, ass, config) {
        // print critical params
        const search_forward_max = config['subsyncer.search.forward']
        this.logSub(`@@@@@@ 最大向前搜索数 = ${search_forward_max}`)
        const offset_alert_max_words = config['subsyncer.alert.offset.words.max']
        this.logSub(`@@@@@@ 时间轴预警最大长度 = ${offset_alert_max_words}个单词`)
        const match_offset_max = config['subsyncer.alert.offset.max']
        this.logSub(`@@@@@@ 最大允许时间轴偏移 = ${match_offset_max} 秒`)
        this.logSub(`@@@@@@ 最大允许差异比例 = ${config['subsyncer.same.tolerant.ratio']}`)
        this.logSub(`@@@@@@ 允许差异的最小长度 = ${config['subsyncer.same.tolerant.words.min']}个单词\n`)

        const matches = []
        let iVTT = 0, iASS = 0
        while (iASS < ass.length) {
            let found = false

            if (this.hasWords(ass[iASS].content_en)) {
                // only compare if not empty
                let iv = iVTT
                while (iv < vtt.length && iv - iVTT < search_forward_max) {
                    if (!this.hasWords(vtt[iv].content)) {
                        iv++
                        continue
                    }

                    const matchResult = this.getMatchResult(vtt, ass, iv, iASS, config)
                    if (matchResult != MATCH_TYPE_NO_MATCH) {
                        const offset = vtt[iv].start - ass[iASS].start
                        const match = {
                            type: matchResult,
                            offset: offset,

                            start_vtt: vtt[iv].start,
                            end_vtt: vtt[iv].end,
                            content_vtt: vtt[iv].content,
                            index_vtt: iv,
                            id_vtt: vtt[iv].id,

                            start_ass: ass[iASS].start,
                            end_ass: ass[iASS].end,
                            content_ass_en: ass[iASS].content_en,
                            content_ass_cn: ass[iASS].content_cn,
                            index_ass: iASS,
                            id_ass: ass[iASS].id
                        }
                        if (this.getWords(ass[iASS].content_en).length <= offset_alert_max_words && Math.abs(offset) > match_offset_max * 1000) {
                            this.logSub(__PRINT_SEPARATOR__)
                            this.logSub(`以下匹配的时间轴偏移量为${offset}，已超过配置的参数值(${match_offset_max * 1000})，已丢弃`)
                            this.printMatch(match)
                        }
                        else {
                            matches.push(match)
                            iVTT = iv + 1
                            found = true
                        }
                        
                        break
                    }

                    iv++
                }
            }

            if (!found && matches.length) {
                // if not found, modify timestamps with previous offset
                ass[iASS].start += matches[matches.length - 1].offset
                ass[iASS].end += matches[matches.length - 1].offset
            }

            iASS++
        }

        return matches
    }

    getMatchResult(vtt, ass, index_vtt, index_ass, config) {
        const content_vtt = vtt[index_vtt].content
        const content_ass = ass[index_ass].content_en

        if (this.isSame(content_vtt, content_ass, config)) {
            return MATCH_TYPE_ALL_SAME
        }

        const multiline_max_offset = config['subsyncer.match.multiline.offset']
        const multi_match_vtt = index_vtt < vtt.length - 1 && this.hasWords(vtt[index_vtt + 1].content) 
            && vtt[index_vtt + 1].start - vtt[index_vtt].start <= multiline_max_offset
        const multi_match_ass = index_ass < ass.length - 1 && this.hasWords(ass[index_ass + 1].content_en) 
            && ass[index_ass + 1].start >= ass[index_ass].start
            && ass[index_ass + 1].start - ass[index_ass].start <= multiline_max_offset

        // try merging current vtt sub with next sub, and then compare
        if (multi_match_vtt) {
            const merged_content = content_vtt + '\n' + vtt[index_vtt + 1].content
            if (this.isSame(merged_content, content_ass, config)) {
                // matched, let's merge these two vtt subs
                vtt[index_vtt].end = Math.max(vtt[index_vtt].end, vtt[index_vtt + 1].end)
                vtt[index_vtt].content = merged_content
                vtt.splice(index_vtt + 1, 1)

                return MATCH_TYPE_VTT_MULTI_SAME
            }
        }

        // try merging current ass sub with next sub, and then compare
        if (multi_match_ass) {
            const merged_content = content_ass + '\n' + ass[index_ass + 1].content_en
            if (this.isSame(content_vtt, merged_content, config)) {
                // matched, let's merge these two ass subs
                ass[index_ass].end = Math.max(ass[index_ass].end, ass[index_ass + 1].end)
                ass[index_ass].content_en = merged_content
                ass[index_ass].content_cn += '\n' + ass[index_ass + 1].content_cn
                ass.splice(index_ass + 1, 1)

                return MATCH_TYPE_ASS_MULTI_SAME
            }
        }

        // compare with both merging two lines
        if (multi_match_vtt && multi_match_ass) {
            const merged_content_vtt = content_vtt + '\n' + vtt[index_vtt + 1].content
            const merged_content_ass = content_ass + '\n' + ass[index_ass + 1].content_en
            if (this.isSame(merged_content_vtt, merged_content_ass, config)) {
                // matched, let's merge these two vtt/ass subs
                vtt[index_vtt].end = Math.max(vtt[index_vtt].end, vtt[index_vtt + 1].end)
                vtt[index_vtt].content = merged_content_vtt
                vtt.splice(index_vtt + 1, 1)
                //
                ass[index_ass].end = Math.max(ass[index_ass].end, ass[index_ass + 1].end)
                ass[index_ass].content_en = merged_content_ass
                ass[index_ass].content_cn += '\n' + ass[index_ass + 1].content_cn
                ass.splice(index_ass + 1, 1)

                return MATCH_TYPE_BOTH_MULTI_SAME
            }
        }

        return this.getSimilarResult(content_vtt, content_ass)
    }

    // 从索引0开始，当开头有连续多个单词相同时则视为相似（允许有一次不同）
    getSimilarResult(sentence1, sentence2) {
        const words_vtt = this.getWords(sentence1.toLowerCase())
        const words_ass = this.getWords(sentence2.toLowerCase())

        let i = 0, j = 0
        let cnt = 0 // 单词相同时加1
        let tolerant = false // 当出现一字偏差时为true (最多只允许一次)
        while (i < words_vtt.length && j < words_ass.length) {
            if (words_vtt[i] == words_ass[j]) {
                i++
                j++
                if (++cnt >= SIMILAR_MIN_WORDS && !tolerant) {
                    return MATCH_TYPE_SIMILAR
                }
            }
            else {
                if (tolerant) {
                    break
                }

                tolerant = true
                if (i < words_vtt.length - 1 && words_vtt[i + 1] == words_ass[j]) {
                    i++
                }
                else if (j < words_ass.length - 1 && words_ass[j + 1] == words_vtt[i]) {
                    j++
                }
                else if (i < words_vtt.length - 1 && j < words_ass.length - 1 && words_vtt[i + 1] == words_ass[j + 1]) {
                    i++
                    j++
                }
                else {
                    break
                }
            }
        }

        if (!tolerant && cnt >= SIMILAR_MIN_WORDS) {
            return MATCH_TYPE_SIMILAR
        }
        if (tolerant && cnt >= SIMILAR_MIN_WORDS_TOLERANT) {
            return MATCH_TYPE_SIMILAR
        }
        return MATCH_TYPE_NO_MATCH
    }

    getMatchResultDesc(matchType) {
        switch (matchType) {
            case MATCH_TYPE_ALL_SAME:
                return '整句相同'
            case MATCH_TYPE_VTT_MULTI_SAME:
                return 'VTT双行相同'
            case MATCH_TYPE_ASS_MULTI_SAME:
                return 'ASS双行相同'
            case MATCH_TYPE_BOTH_MULTI_SAME:
                return '双行相同'
            case MATCH_TYPE_SIMILAR:
                return '开头相同'
            default:
                return '未匹配'
        }
    }

    isSame(content_vtt, content_ass, config) {
        const words_vtt = this.getWords(content_vtt.toLowerCase())
        const words_ass = this.getWords(content_ass.toLowerCase())

        // 1. 根据宽容度配置，允许两个句子有一定比例的单词数不同
        if (words_ass.length >= config['subsyncer.same.tolerant.words.min']) {
            const similarity = stringSimilarity(content_vtt, content_ass)
            if (similarity >= 1 - config['subsyncer.same.tolerant.ratio']) {
                return true
            }
        }

        // 2. 当全部单词相同则认为整句相同（允许有一次不同）

        if (Math.abs(words_vtt.length - words_ass.length) > 1) {
            return false
        }

        let i = 0, j = 0
        let tolerant = false // 当出现一字偏差时为true (最多只允许一次) 
        while (i < words_vtt.length && j < words_ass.length) {
            if (words_vtt[i] == words_ass[j]) {
                i++
                j++
            }
            else {
                if (tolerant) {
                    return false
                }
                if (words_vtt.length < SAME_MIN_LENGTH_TOLERANT || words_ass.length < SAME_MIN_LENGTH_TOLERANT) {
                    return false
                }

                tolerant = true
                if (words_vtt.length > words_ass.length) {
                    i++
                }
                else if (words_vtt.length < words_ass.length) {
                    j++
                }
                else {
                    i++
                    j++
                }
            }
        }

        return words_vtt.length == words_ass.length
            || (words_vtt.length >= SAME_MIN_LENGTH_TOLERANT && words_ass.length >= SAME_MIN_LENGTH_TOLERANT)
    }

    printMatch(match) {
        this.logSub(`${this.msToStr(match.start_ass, false)},${this.msToStr(match.end_ass, false)}`)
        this.logSub(match.content_ass_cn)
        this.logSub(match.content_ass_en)
        this.logSub(__PRINT_SEPARATOR__)
        this.logSub(`${this.msToStr(match.start_vtt, false)},${this.msToStr(match.end_vtt, false)}`)
        this.logSub(match.content_vtt)
        this.logSub(__PRINT_SEPARATOR__)
        this.logSub(`【${this.getMatchResultDesc(match.type)}】offset = ${match.offset}, index_ass = ${match.index_ass}, index_vtt = ${match.index_vtt}`)
        this.logSub('\n')
    }

    readSyncerDB(series_name) {
        const path = `${series_name}/${FN_SUB_SYNCER_DB}`
        let root
        try {
            const body = this.readFile(path, 'utf8', true)
            if (body) {
                root = JSON.parse(body)
            }
        }
        catch (e) {
            this.log(e)
        }

        return root
    }

    readVTT(body) {
        // 注意vtt有两种格式：1. 不带数字编号(大多数情况) 2.带数字编号

        // 00:00:08.133 --> 00:00:10.510 line:85% position:50% size:48%
        // <i>Alone in the world.</i>

        // or:

        // 3
        // 00:01:08.360 --> 00:01:09.653 align:start position:48% line:79%
        // <i>All he does is just talk about</i>
        const vtt = []
        const lines = [...body.matchAll(/(\d{2}:\d{2}:\d{2}\.\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}\.\d{3}).*([\s\S]*?)(?=(\d+\n)|\d{2}:\d{2}:\d{2}\.\d{3}|$)/g)]
        let id = 0
        for (const line of lines) {
            const content = this.trimVTT(line[3])
            if (!this.hasWords(content)) continue

            vtt.push({
                start: this.strToMS(line[1]),
                end: this.strToMS(line[2]),
                content: content,
                id: ++id
            })
        }

        // 部分流媒体的vtt分片可能重复上一个分片的内容，此处尽可能合并body相同的字幕
        let i = 0
        while (i < vtt.length) {
            if (i > 0 && vtt[i].content == vtt[i - 1].content 
                && (vtt[i].start == vtt[i - 1].start || vtt[i].start == vtt[i - 1].end)) {
                vtt.splice(i - 1, 2, {
                    start: vtt[i - 1].start,
                    end: vtt[i].end,
                    content: vtt[i].content,
                    id: vtt[i - 1].id
                })
            }
            else {
                i++
            }
        }

        return vtt
    }

    repairASS(body) {
        const lines = [...body.matchAll(/Dialogue:\s+\d+,(\d{1,2}:\d{2}:\d{2}\.\d{2,3}),(\d{1,2}:\d{2}:\d{2}\.\d{2,3}).+,0+,0+,0+,,(.+)/g)]
        if (lines.filter(l => l[3].includes('\\N')).length >= 20) {
            // 发现换行符，不需要修复
            return body
        }

        lines.sort((l, r) => this.strToMS(l[1]) - this.strToMS(r[1]))
        let newBody = ''
        let i = 0
        while (i < lines.length - 1) {
            newBody += `Dialogue: 0,${lines[i][1]},${lines[i][2]},Default,,0,0,0,,${lines[i][3]}\\N${lines[i + 1][3]}\n`
            i += 2
        }
        return newBody
    }

    readASS(body) {
        const ass = []
        const regex = this.getConfig('subsyncer.purify.regex')
        // Dialogue: 0,0:00:51.27,0:00:52.44,*Default,NTP,0000,0000,0000,,小心\N{\fn微软雅黑}{\b0}{\fs14}{\3c&H202020&}{\shad1}Watch out!
        const lines = [...body.matchAll(/Dialogue:\s+\d+,(\d{1,2}:\d{2}:\d{2}\.\d{2,3}),(\d{1,2}:\d{2}:\d{2}\.\d{2,3}).+,0+,0+,0+,,(.+)/g)]
        let id = 0
        for (const line of lines) {
            // remove by regex rule from config file
            if (regex) {
                try {
                    if (RegExp(regex).test(line[0])) {
                        continue
                    }
                }
                catch {}
            }

            // remove special effect
            // Dialogue: 0,0:02:33.54,0:02:33.59,GDVFX,,0,0,0,,{=6}{\bord0.61\shad0.2\fn黑体\fax0.15\c&H000000&\fscx100.13\fscy121.37\frz353.9\b1\pos(374.37,268.87)\frx16\fry12}我已经做到最好
            if (/.+,0+,0+,0+,,\{=\d+\}/.test(line[0])) {
                continue
            }

            const content = this.trimASS(line[3])
            if (!/[\u4E00-\u9FFF]+/g.test(content)) {
                // no cn? it must be special effect or other trash
                continue
            }

            const parts = content.split('\\N')
            // en and cn can both be multi-line
            const midLen = parseInt(parts.length / 2)
            let cn = parts.slice(0, midLen).join('\n')
            let en = parts.slice(midLen).join('\n')
            if (/[\u4E00-\u9FFF]+/g.test(en)) {
                // en part contains cn? it means no en line, it's all cn
                cn = content.replace(/\\N/g, '\n')
                en = ''
            }
            ass.push({
                start: this.strToMS(line[1]),
                end: this.strToMS(line[2]),
                content_en: en,
                content_cn: cn,
                id: ++id
            })
        }
        return ass
    }

    saveSRT(ass, series_name, epInfo) {
        let body = ''
        ass.forEach((line, i) => {
            body += `${i + 1}\r\n`
            body += `${this.msToStr(line.start)} --> ${this.msToStr(line.end)}\r\n`
            body += line.content_cn
            body += '\r\n\r\n'
        })

        const path = this.getSrtPath(series_name, epInfo)
        this.writeFile(path, body, true)
        this.logMain(`### 自动调轴后的SRT字幕已生成: iCloud云盘/Quantumult X/Data/Subtitles/${path}`)
    }

    getWords(sentence) {
        return sentence.match(/\b(\w+)/g) || []
    }

    hasWords(sentence) {
        return this.getWords(sentence).length > 0
    }

    trimVTT(body) {
        // <i>Thank you for calling</i>
        // (Man) Thank you for calling
        // Man: Thank you for calling
        // [Door knocking sound]
        let newBody = body.replace(/<\/?[^>]+>|\([^\)]+\)|^\s*[a-z\d\- ']{3,15}:|\[[^\]]+\]|"/gi, '').trim()
        // newBody = newBody.replace(/♪.+♪/g, '')
        newBody = this.replaceSingleQuotWords(newBody)
        newBody = this.replaceOtherWords(newBody)
        return newBody
    }

    trimASS(body) {
        // remove tags like: {\fn微软雅黑}{\b0}{\fs14}{\3c&H202020&}{\shad1}text
        let newBody = body.replace(/\{\\.*?\}|■/g, '').replace(/ {2,}/g, ' ').trim()
        newBody = this.replaceSingleQuotWords(newBody)
        newBody = this.replaceOtherWords(newBody)
        return newBody
    }

    replaceSingleQuotWords(body) {
        // I'm n't 'll 's 've 're 'd 'Cause
        let newBody = body
        newBody = newBody.replace(/I'm\b/gi, 'I am')
        newBody = newBody.replace(/([a-z])n't\b/gi, '$1 not')
        newBody = newBody.replace(/([a-z])'ll\b/gi, '$1 will')
        newBody = newBody.replace(/([a-z])'s\b/gi, '$1 is')
        newBody = newBody.replace(/([a-z])'ve\b/gi, '$1 have')
        newBody = newBody.replace(/([a-z])'re\b/gi, '$1 are')
        newBody = newBody.replace(/([a-z])'d\b/gi, '$1 would')
        newBody = newBody.replace(/'Cause\b/gi, 'because')
        return newBody
    }

    replaceOtherWords(body) {
        // a.m p.m
        let newBody = body
        newBody = newBody.replace(/\ba\.m\b/gi, 'am')
        newBody = newBody.replace(/\bp\.m\b/gi, 'pm')
        return newBody
    }

    msToStr(ms, srt = true) {
        // 00:00:10.120
        const hour = Math.floor(ms / (60 * 60 * 1000))
        const minutes = Math.floor((ms - hour * 60 * 60 * 1000) / (60 * 1000))
        const seconds = Math.floor((ms - hour * 60 * 60 * 1000 - minutes * 60 * 1000) / (1000))
        const milliseconds = ms % 1000
        return hour.toString().padStart(2, '0')
            + ':' + minutes.toString().padStart(2, '0')
            + ':' + seconds.toString().padStart(2, '0')
            + (srt ? ',' : '.') + milliseconds.toString().padStart(3, '0')
    }

    strToMS(str, srt = false) {
        // 00:00:10.120
        const pts = str.split(srt ? ',' : '.')
        var ts = parseInt(pts[1])
        const parts = pts[0].split(':')
        for (const [i, val] of parts.entries()) {
            ts += 1000 * (60 ** (2 - i)) * parseInt(val);
        }
        return ts
    }

    getPercentage(numerator, denominator) {
        if (denominator) {
            return `${Math.round(numerator * 1000.0 / denominator) / 10}%`
        }
        return `${Math.round(numerator * 1000.0) / 10}%`
    }

    // match result summary
    logMain(msg) {
        this.main_log += msg + '\n'
        this.log(msg)
    }

    // match result details, per episode
    logSub(msg) {
        this.sub_log += msg + '\n'
    }

    log(...args) {
        console.log(...args)
    }

    async download_vtts(urls) {
        let concurrent_size = this.getConfigInt('subsyncer.download.concurrent', 100)
        let content = ''
        const remaining = [...urls] // deep copy
        while (remaining.length) {
            content += await this._download_batch(remaining.splice(0, concurrent_size))
            const progress = (urls.length - remaining.length) * 100.0 / urls.length
            this.log(`[${Math.round(progress)}%] 正在下载vtt文件，请稍候...`)
        }
        return content
    }

    async _download_batch(urls) {
        const downloads = await urls.map((url, i) => this._download_vtt(url, i))
        return Promise.all(downloads).then(contents => {
            return contents.sort((l, r) => l.index - r.index).map(c => c.content).join('')
        })
    }

    async _download_vtt(url, i) {
        return new Promise((resolve, reject) => {
            fetch(url).then(resp => resp.text()).then(body => {
                // check vtt content
                if (/WEBVTT\s*\n|(\d{2}:\d{2}:\d{2}\.\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}\.\d{3})/.test(body)) {
                    const lines = body.match(/(\d{2}:\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}:\d{2}\.\d{3}).*([\s\S]*?)(?=\d{2}:\d{2}:\d{2}\.\d{3}|$)/g) || []
                    resolve({ index: i, content: lines.join('') })
                }
                else {
                    reject(new Error(`invalid vtt body:\n${body}\nurl: ${url}`))
                }
            })
        })
    }

    saveMainLog(series_name) {
        const path = `${DATA_DIR}/${series_name}/${LOG_DIR}/${FN_MAIN_LOG}`
        this.writeFile(path, this.main_log)
    }

    saveSubLog(series_name, epInfo) {
        const path = `${DATA_DIR}/${series_name}/${LOG_DIR}/${epInfo}.log`
        this.writeFile(path, this.sub_log)
    }

    getConfig(key, idx=0) {
        const prefix = idx > 0 ? `.${idx}` : ''
        const path = `${CONF_DIR}/sub_syncer${prefix}.conf`
        const body = this.readFile(path)
        if (!body) {
            throw new Error(`config file not found: ${path}`)
        }

        const m = new RegExp(String.raw`^\s*${key}\s*=\s*(.+)\s*$`, 'im').exec(body)
        if (!m && idx > 0) {
            return this.getConfig(key)
        }
        return m && m[1].trim()
    }

    getConfigInt(key, defaultVal, idx=0) {
        let val = this.getConfig(key, idx)
        try {
            return val ? parseInt(val) : defaultVal
        }
        catch {
            return defaultVal
        }
    }

    getConfigFloat(key, defaultVal, idx = 0) {
        let val = this.getConfig(key, idx)
        try {
            return val ? parseFloat(val) : defaultVal
        }
        catch {
            return defaultVal
        }
    }

    getConfigBool(key, defaultVal, idx = 0) {
        let val = this.getConfig(key, idx)
        return val ? val.toLowerCase() == 'true' : defaultVal
    }

    readMultiConfig(idx) {
        const prefix = idx > 0 ? `.${idx}` : ''
        const path = `${CONF_DIR}/sub_syncer${prefix}.conf`
        if (idx > 0 && !this.exists(path)) {
            return null
        }

        const params = [
            // int
            { key: 'subsyncer.search.forward', default: SEARCH_FORWARD_MAX, type: 'int' },
            { key: 'subsyncer.alert.offset.words.max', default: MATCH_OFFSET_ALERT_MAX_WORDS, type: 'int' },
            { key: 'subsyncer.alert.offset.max', default: MATCH_OFFSET_MAX, type: 'int' },
            { key: 'subsyncer.same.tolerant.words.min', default: MATCH_SAME_TOLERANT_MIN_WORDS, type: 'int' },
            { key: 'subsyncer.match.multiline.offset', default: MATCH_MULTI_LINE_MAX_OFFSET * 1000, type: 'int' },
            // float
            { key: 'subsyncer.same.tolerant.ratio', default: MATCH_SAME_TOLERANT_RATIO, type: 'float' },
            // bool
            // str
        ]
        const config = {}
        for (const param of params) {
            let val
            if (param.type == 'int') {
                val = this.getConfigInt(param.key, param.default, idx)
            }
            else {
                val = this.getConfigFloat(param.key, param.default, idx)
            }
            config[param.key] = val
        }
        return config
    }

    getSrtPath(series_name, epInfo) {
        return `${series_name}/${epInfo.slice(0, 3)}/${epInfo}.srt`
    }

    getVttPath(series_name, epInfo) {
        return `${DATA_DIR}/${series_name}/${VTT_DIR}/${epInfo}.vtt`
    }

    async getAssPath(series_name, epInfo) {
        const assDir = `${DATA_DIR}/${series_name}`
        const files = await fs.promises.readdir(path.join(this.getRootPath(), assDir))
        for (const f of files) {
            if (RegExp(String.raw`^(?!\.).*?${epInfo}.*?\.ass$`, 'i').test(f)) {
                this.log(`已发现ass文件: ${f}`)
                return path.join(assDir, f)
            }
        }
        return path.join(assDir, `${epInfo}.ass`)
    }

    readFile(fpath, encoding = 'utf8', iCloud = false) {
        const rootPath = iCloud ? this.getICloudPath() : this.getRootPath()
        const realPath = path.join(rootPath, fpath)
        return fs.readFileSync(realPath, encoding)
    }

    writeFile(fpath, content, iCloud = false) {
        const rootPath = iCloud ? this.getICloudPath() : this.getRootPath()
        const realPath = path.join(rootPath, fpath)
        // create folder if it's not there
        const dir = path.dirname(realPath)
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true })
        }
        fs.writeFileSync(realPath, content)
    }

    exists(fpath, iCloud = false) {
        const rootPath = iCloud ? this.getICloudPath() : this.getRootPath()
        const realPath = path.join(rootPath, fpath)
        return fs.existsSync(realPath)
    }

    deepCopy(obj) {
        return JSON.parse(JSON.stringify(obj))
    }

    getRootPath() {
        return path.resolve()
    }

    getICloudPath() {
        if (process.platform == 'win32') {
            return `${os.homedir()}/iCloudDrive/iCloud~com~crossutility~quantumult-x/Data/Subtitles`
        }
        return `${process.env.HOME}/Library/Mobile Documents/iCloud~com~crossutility~quantumult-x/Documents/Data/Subtitles`
    }
}