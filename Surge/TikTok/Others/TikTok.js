var watermark = body => {
    try {
        body.replace(/\"room_id\":(\d{2,})/g, '"room_id":"$1"');
        let obj = JSON.parse(body);
        if (obj.data) obj.data = Follow(obj.data);
        if (obj.aweme_list) obj.aweme_list = Feed(obj.aweme_list);
        if (obj.aweme_detail) obj.aweme_detail = Share(obj.aweme_detail);
        if (obj.aweme_details) obj.aweme_details = Feed(obj.aweme_details);
        $done({ body: JSON.stringify(obj) });
} catch (err) {
        console.log("aaaaa!!!!\n" + err);
        $done({});
    }
}
watermark($response.body);

function Follow(data) {
    if (data && data.length > 0) {
        for (let i in data) {
            if (data[i].aweme.video) video_lists(data[i].aweme);
        }
    }
    return data;
}

function Feed(aweme_list) {
    if (aweme_list && aweme_list.length > 0) {
        for (let i in aweme_list) {
            if (aweme_list[i].is_ads == true) {
                aweme_list.splice(i, 1);
            } else if (aweme_list[i].video) {
                video_lists(aweme_list[i]);
            } else {
                if (!enabled_live) aweme_list.splice(i, 1);
            }
        }
    }
    return aweme_list;
}

function Share(aweme_detail) {

    if (aweme_detail.video) video_lists(aweme_detail);
    return aweme_detail;
}

function video_lists(lists) {
    lists.prevent_download = false;
    //  lists.music.prevent_download = false;
    // lists.music.is_commerce_music = false ;
    //
    // lists.music.is_original_sound = true;
    //
    lists.status.reviewed = 1;
    lists.video_control.allow_download = true;

    //lists.video_control.allow_music = true;

    lists.video_control.prevent_download_type = 0;
    delete lists.video.misc_download_addrs;
    lists.video.download_addr = lists.video.play_addr;
    lists.video.download_suffix_logo_addr = lists.video.play_addr;
    lists.aweme_acl.download_general.mute = false;
    if (lists.aweme_acl.download_general.extra) {
        delete lists.aweme_acl.download_general.extra;
        lists.aweme_acl.download_general.code = 0;
        lists.aweme_acl.download_general.show_type = 2;
        lists.aweme_acl.download_general.transcode = 3;
        lists.aweme_acl.download_mask_panel = lists.aweme_acl.download_general;
        lists.aweme_acl.share_general = lists.aweme_acl.download_general;
    }
    return lists;
}
