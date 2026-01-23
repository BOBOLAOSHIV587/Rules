// telecom/cards/small/smallCardStyles.tsx 小卡样式

import { VStack, HStack, ZStack, Text, Spacer, Image } from "scripting"
import type { SmallCardCommonProps } from "./common"

export type SmallStyleKey = "TripleRows" | "IconCells" | "BalanceFocus" | "DualList" | "DualGauges" | "TextList"

export const SMALL_STYLE_OPTIONS: Array<{
  key: SmallStyleKey
  nameCN: string
  nameEN: string
}> = [
    { key: "TripleRows", nameCN: "三条信息卡", nameEN: "TripleRows" },
    { key: "IconCells", nameCN: "圆标信息卡", nameEN: "IconCells" },
    { key: "BalanceFocus", nameCN: "余额主卡", nameEN: "BalanceFocus" },
    { key: "DualList", nameCN: "列表双条", nameEN: "DualList" },
    { key: "DualGauges", nameCN: "双环仪表", nameEN: "DualGauges" },
    { key: "TextList", nameCN: "文字清单", nameEN: "TextList" },
  ]

// —— 系统 tint ——
const TINT_FEE: any = "systemOrange"
const TINT_FLOW: any = "systemBlue"
const TINT_VOICE: any = "systemGreen"
const TINT_OTHER: any = "systemPurple"

// —— 小组件统一内边距 ——
function Root(props: { children: any }) {
  return (
    <VStack padding={{ top: 12, leading: 12, bottom: 12, trailing: 12 }} spacing={10}>
      {props.children}
    </VStack>
  )
}

function parseFeeText(feeText: string): { balance: string; unit: string } {
  const s = String(feeText ?? "").trim()
  const m = s.match(/^([0-9]+(?:\.[0-9]+)?)(.*)$/)
  if (!m) return { balance: s || "0", unit: "" }
  return { balance: m[1] || "0", unit: (m[2] || "").trim() }
}

function LogoImage({ logoPath, size }: { logoPath?: string; size: number }) {
  if (!logoPath) return null as any
  return <Image filePath={logoPath} frame={{ width: size, height: size }} />
}

function SoftCard(props: { children: any }) {
  return (
    <VStack
      padding={{ top: 8, leading: 10, bottom: 8, trailing: 10 }}
      widgetBackground={{
        style: "systemGray6",
        shape: { type: "rect", cornerRadius: 12, style: "continuous" },
      }}
    >
      {props.children}
    </VStack>
  )
}

function Pill({ text, tint }: { text: string; tint: any }) {
  return (
    <VStack
      padding={{ top: 1, leading: 6, bottom: 1, trailing: 6 }}
      widgetBackground={{
        style: tint,
        shape: { type: "capsule", style: "continuous" },
      }}
    >
      <Text font={9} fontWeight="semibold" foregroundStyle="white" lineLimit={1} minScaleFactor={0.7}>
        {text}
      </Text>
    </VStack>
  )
}

function ValueWithUnit(props: { value: string; unit: string; big?: boolean }) {
  return (
    <HStack alignment="center" spacing={4}>
      <Text font={props.big ? 16 : 14} fontWeight="semibold" lineLimit={1} minScaleFactor={0.7}>
        {props.value}
      </Text>
      <Text font={10} fontWeight="semibold" foregroundStyle="secondaryLabel" lineLimit={1} minScaleFactor={0.7}>
        {props.unit}
      </Text>
    </HStack>
  )
}

function HeaderBalance(props: { logoPath?: string; title: string; balance: string; unit: string; updateTime?: string }) {
  return (
    <HStack alignment="center" spacing={8}>
      <VStack spacing={2} alignment="leading">
        <Text font={10} foregroundStyle="secondaryLabel" lineLimit={1} minScaleFactor={0.7}>
          {props.title}
        </Text>
        <HStack alignment="center" spacing={4}>
          <Text font={22} fontWeight="bold" lineLimit={1} minScaleFactor={0.7}>
            {props.balance}
          </Text>
          <Text font={10} fontWeight="semibold" foregroundStyle="secondaryLabel" lineLimit={1} minScaleFactor={0.7}>
            {props.unit}
          </Text>
        </HStack>
      </VStack>

      <Spacer />

      <VStack spacing={2} alignment="trailing">
        <LogoImage logoPath={props.logoPath} size={24} />
        {props.updateTime ? (
          <Text font={9} foregroundStyle="secondaryLabel" lineLimit={1} minScaleFactor={0.7}>
            {props.updateTime}
          </Text>
        ) : null}
      </VStack>
    </HStack>
  )
}

function InfoRow(props: { tint: any; label: string; value: string; unitText?: string }) {
  return (
    <HStack alignment="center" spacing={8}>
      <VStack
        frame={{ width: 3, height: 18 }}
        widgetBackground={{ style: props.tint, shape: { type: "capsule", style: "continuous" } }}
      />

      <VStack spacing={1} alignment="leading">
        <Text font={10} foregroundStyle="secondaryLabel" lineLimit={1} minScaleFactor={0.7}>
          {props.label}
        </Text>
        <Text font={14} fontWeight="semibold" lineLimit={1} minScaleFactor={0.7}>
          {props.value}
        </Text>
      </VStack>

      <Spacer />

      {props.unitText ? <Pill text={props.unitText} tint={props.tint} /> : null}
    </HStack>
  )
}

// ========================
// Style 1：三条信息卡
// ========================
export function TripleRowsSmallStyle(props: SmallCardCommonProps) {
  const fee = parseFeeText(props.feeText)

  const Row = (p: { tint: any; title: string; value: string; unit: string; rightLogo?: boolean }) => (
    <HStack alignment="center" spacing={8}>
      <VStack spacing={2} alignment="leading">
        <Text font={10} foregroundStyle="secondaryLabel" lineLimit={1} minScaleFactor={0.7}>
          {p.title}
        </Text>
        <ValueWithUnit value={p.value} unit={p.unit} big />
      </VStack>

      <Spacer />

      {p.rightLogo ? (
        <LogoImage logoPath={props.logoPath} size={22} />
      ) : (
        <VStack
          frame={{ width: 22, height: 22 }}
          widgetBackground={{ style: p.tint, shape: { type: "rect", cornerRadius: 6, style: "continuous" } }}
        />
      )}
    </HStack>
  )

  return (
    <Root>
      <SoftCard>
        <Row tint={TINT_FEE} title={props.feeTitle || "余额"} value={fee.balance} unit={fee.unit || "元"} rightLogo />
      </SoftCard>
      <SoftCard>
        <Row tint={TINT_FLOW} title={props.flowLabel || "通用流量"} value={String(props.flowValue ?? "0")} unit={String(props.flowUnit ?? "")} />
      </SoftCard>
      <SoftCard>
        <Row tint={TINT_VOICE} title={props.voiceLabel || "语音"} value={String(props.voiceValue ?? "0")} unit={String(props.voiceUnit ?? "")} />
      </SoftCard>
    </Root>
  )
}

// ========================
// Style 2：圆标信息卡
// ========================
export function IconCellsSmallStyle(props: SmallCardCommonProps) {
  const fee = parseFeeText(props.feeText)

  const Cell = (p: { tint: any; title: string; value: string; unit: string; leftLogo?: boolean }) => (
    <HStack alignment="center" spacing={10}>
      <ZStack frame={{ width: 34, height: 34 }}>
        <VStack
          frame={{ width: 34, height: 34 }}
          widgetBackground={{ style: p.tint, shape: { type: "rect", cornerRadius: 17, style: "continuous" } }}
        />
        {p.leftLogo ? <LogoImage logoPath={props.logoPath} size={20} /> : null}
      </ZStack>

      <VStack spacing={2} alignment="leading">
        <ValueWithUnit value={p.value} unit={p.unit} big />
        <Text font={10} foregroundStyle="secondaryLabel" lineLimit={1} minScaleFactor={0.7}>
          {p.title}
        </Text>
      </VStack>

      <Spacer />
    </HStack>
  )

  return (
    <Root>
      <SoftCard>
        <Cell tint={TINT_FEE} title={props.feeTitle || "余额"} value={fee.balance} unit={fee.unit || "元"} leftLogo />
      </SoftCard>
      <SoftCard>
        <Cell tint={TINT_FLOW} title={props.flowLabel || "通用流量"} value={String(props.flowValue ?? "0")} unit={String(props.flowUnit ?? "")} />
      </SoftCard>
      <SoftCard>
        <Cell tint={TINT_VOICE} title={props.voiceLabel || "语音"} value={String(props.voiceValue ?? "0")} unit={String(props.voiceUnit ?? "")} />
      </SoftCard>
    </Root>
  )
}

// ========================
// Style 3：余额主卡 + 下两块
// ========================
export function BalanceFocusSmallStyle(props: SmallCardCommonProps) {
  const fee = parseFeeText(props.feeText)

  return (
    <Root>
      <VStack spacing={10}>
        <HStack alignment="center" spacing={8}>
          <ZStack frame={{ width: 24, height: 24 }}>
            <VStack
              frame={{ width: 24, height: 24 }}
              widgetBackground={{ style: TINT_FEE, shape: { type: "rect", cornerRadius: 12, style: "continuous" } }}
            />
            <LogoImage logoPath={props.logoPath} size={18} />
          </ZStack>

          <HStack alignment="center" spacing={4}>
            <Text font={24} fontWeight="bold" lineLimit={1} minScaleFactor={0.7}>
              {fee.balance}
            </Text>
            <Text font={10} fontWeight="semibold" foregroundStyle="secondaryLabel" lineLimit={1} minScaleFactor={0.7}>
              {fee.unit || "元"}
            </Text>
          </HStack>

          <Spacer />
        </HStack>

        <HStack alignment="center" spacing={10}>
          <VStack
            spacing={6}
            alignment="leading"
            padding={{ top: 8, leading: 10, bottom: 8, trailing: 10 }}
            widgetBackground={{ style: "systemGray6", shape: { type: "rect", cornerRadius: 12, style: "continuous" } }}
          >
            <Text font={10} foregroundStyle="secondaryLabel" lineLimit={1} minScaleFactor={0.7}>
              {props.flowLabel || "通用流量"}
            </Text>
            <Text font={16} fontWeight="semibold" lineLimit={1} minScaleFactor={0.7}>
              {String(props.flowValue ?? "0")}
              {String(props.flowUnit ?? "")}
            </Text>
          </VStack>

          <VStack
            spacing={6}
            alignment="leading"
            padding={{ top: 8, leading: 10, bottom: 8, trailing: 10 }}
            widgetBackground={{ style: "systemGray6", shape: { type: "rect", cornerRadius: 12, style: "continuous" } }}
          >
            <Text font={10} foregroundStyle="secondaryLabel" lineLimit={1} minScaleFactor={0.7}>
              {props.voiceLabel || "语音"}
            </Text>
            <Text font={16} fontWeight="semibold" lineLimit={1} minScaleFactor={0.7}>
              {String(props.voiceValue ?? "0")}
              {String(props.voiceUnit ?? "")}
            </Text>
          </VStack>
        </HStack>
      </VStack>
    </Root>
  )
}

// ========================
// Style 4：上余额卡 + 下 list 两条（可选第三条）
// ========================
export function DualListSmallStyle(props: SmallCardCommonProps) {
  const fee = parseFeeText(props.feeText)

  const showOther = !!(props.otherFlowLabel && String(props.otherFlowLabel).trim().length > 0)

  return (
    <Root>
      <VStack spacing={10}>
        <VStack
          padding={{ top: 10, leading: 12, bottom: 10, trailing: 12 }}
          widgetBackground={{ style: "systemGray6", shape: { type: "rect", cornerRadius: 14, style: "continuous" } }}
          spacing={8}
        >
          <HeaderBalance
            logoPath={props.logoPath}
            title={props.feeTitle || "余额"}
            balance={fee.balance}
            unit={fee.unit || "元"}
            updateTime={props.updateTime}
          />
        </VStack>

        <VStack
          padding={{ top: 8, leading: 10, bottom: 8, trailing: 10 }}
          widgetBackground={{ style: "systemGray6", shape: { type: "rect", cornerRadius: 12, style: "continuous" } }}
          spacing={showOther ? 6 : 7}
        >
          <InfoRow
            tint={TINT_FLOW}
            label={props.flowLabel || "通用流量"}
            value={`${String(props.flowValue ?? "0")}${String(props.flowUnit ?? "")}`}
            unitText={String(props.flowUnit ?? "GB").toUpperCase()}
          />

          {showOther ? (
            <InfoRow
              tint={TINT_OTHER}
              label={String(props.otherFlowLabel)}
              value={`${String(props.otherFlowValue ?? "0")}${String(props.otherFlowUnit ?? "")}`}
              unitText={String(props.otherFlowUnit ?? "GB").toUpperCase()}
            />
          ) : null}

          <InfoRow
            tint={TINT_VOICE}
            label={props.voiceLabel || "语音"}
            value={`${String(props.voiceValue ?? "0")}${String(props.voiceUnit ?? "")}`}
            unitText={"MIN"}
          />
        </VStack>
      </VStack>
    </Root>
  )
}

// ========================
// Style 5：双环仪表（稳定版“环感”UI）
// ========================
export function DualGaugesSmallStyle(props: SmallCardCommonProps) {
  const fee = parseFeeText(props.feeText)

  const Ring = (p: { tint: any; title: string; value: string; unit: string }) => (
    <VStack alignment="center" spacing={6}>
      <ZStack frame={{ width: 68, height: 68 }}>
        <VStack
          frame={{ width: 68, height: 68 }}
          widgetBackground={{ style: "systemGray6", shape: { type: "rect", cornerRadius: 34, style: "continuous" } }}
        />
        <VStack
          frame={{ width: 52, height: 52 }}
          widgetBackground={{ style: p.tint, shape: { type: "rect", cornerRadius: 26, style: "continuous" } }}
        />
        <VStack alignment="center" spacing={1}>
          <HStack alignment="center" spacing={3}>
            <Text font={14} fontWeight="semibold" lineLimit={1} minScaleFactor={0.7}>
              {p.value}
            </Text>
            <Text font={8} fontWeight="bold" foregroundStyle="secondaryLabel" lineLimit={1} minScaleFactor={0.7}>
              {p.unit}
            </Text>
          </HStack>
        </VStack>
      </ZStack>

      <Text font={10} foregroundStyle="secondaryLabel" lineLimit={1} minScaleFactor={0.7}>
        {p.title}
      </Text>
    </VStack>
  )

  return (
    <Root>
      <VStack spacing={10}>
        <HStack alignment="center" spacing={8}>
          <Spacer />
          <LogoImage logoPath={props.logoPath} size={28} />
          <Spacer />
          <Text font={22} fontWeight="bold" lineLimit={1} minScaleFactor={0.7}>
            {fee.balance}
          </Text>
          <Text font={10} fontWeight="semibold" foregroundStyle="secondaryLabel" lineLimit={1} minScaleFactor={0.7}>
            {fee.unit || "元"}
          </Text>
          <Spacer />
        </HStack>

        <HStack alignment="center" spacing={10}>
          <Ring tint={TINT_FLOW} title={props.flowLabel || "通用流量"} value={String(props.flowValue ?? "0")} unit={String(props.flowUnit ?? "")} />
          <Spacer />
          <Ring tint={TINT_VOICE} title={props.voiceLabel || "语音"} value={String(props.voiceValue ?? "0")} unit={String(props.voiceUnit ?? "")} />
        </HStack>
      </VStack>
    </Root>
  )
}

// ========================
// Style 6：文字清单（可选第三行）
// ========================
export function TextListSmallStyle(props: SmallCardCommonProps) {
  const fee = parseFeeText(props.feeText)

  const Line = (p: { tint: any; title: string; value: string }) => (
    <HStack alignment="center" spacing={8}>
      <VStack
        frame={{ width: 10, height: 10 }}
        widgetBackground={{ style: p.tint, shape: { type: "rect", cornerRadius: 3, style: "continuous" } }}
      />
      <Text font={13} foregroundStyle="secondaryLabel" lineLimit={1} minScaleFactor={0.7}>
        {p.title}
      </Text>
      <Spacer />
      <Text font={13} fontWeight="medium" lineLimit={1} minScaleFactor={0.7}>
        {p.value}
      </Text>
    </HStack>
  )

  const showOther = !!(props.otherFlowLabel && String(props.otherFlowLabel).trim().length > 0)

  return (
    <Root>
      <VStack spacing={10}>
        <HStack alignment="center" spacing={8}>
          <Spacer />
          <LogoImage logoPath={props.logoPath} size={28} />
          <Spacer />
          <Text font={22} fontWeight="bold" lineLimit={1} minScaleFactor={0.7}>
            {fee.balance}
          </Text>
          <Text font={10} fontWeight="semibold" foregroundStyle="secondaryLabel" lineLimit={1} minScaleFactor={0.7}>
            {fee.unit || "元"}
          </Text>
          <Spacer />
        </HStack>

        <Line tint={TINT_FLOW} title={props.flowLabel || "通用流量"} value={`${String(props.flowValue ?? "0")}${String(props.flowUnit ?? "")}`} />
        {showOther ? (
          <Line
            tint={TINT_OTHER}
            title={String(props.otherFlowLabel)}
            value={`${String(props.otherFlowValue ?? "0")}${String(props.otherFlowUnit ?? "")}`}
          />
        ) : null}
        <Line tint={TINT_VOICE} title={props.voiceLabel || "语音"} value={`${String(props.voiceValue ?? "0")}${String(props.voiceUnit ?? "")}`} />
      </VStack>
    </Root>
  )
}
