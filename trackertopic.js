document.write(`<style>
.fizztrackerwrap, .fizzhistorywrap {position: relative; max-width: 70%; margin: 31px auto; padding: 10px 25px; color: var(--whitepost); outline: 1px solid #ddd; outline-offset: 15px; background: #fff;}
.fizztrackerwrap p, .fizzhistorywrap p {
    position: relative;
    font-size: 1.2em;
    border-bottom: 1px solid var(--border);
    padding-bottom: 0.35em;
    display: flex;
    justify-content: space-between; text-transform: uppercase; font-style: italic;
    font-family: var(--fontstyled); font-size: var(--font7);
}
.fizzthreadwrap {display: block; position: relative; text-decoration: none;}
.tracker-item {margin-left: 3em; margin-bottom: 0.5em; font-family: var(--fontstyle2)!important; font-size: var(--font2); text-transform: lowercase; letter-spacing: 0.5px; }
.fizztrackerwrap .tracker-item {text-indent: -4.00em;}
.tracker-item .status {width: 1.5em; text-align: center; font-size: var(--font2); display: inline-flex; line-height: 1; }
.tracker-item a { text-transform: uppercase; font-size: var(--font3); border-bottom: 1px solid var(--border); padding: 0px;  letter-spacing: 1px; font-weight: 900; margin-bottom: 2px;}
.tracker-desc { line-height: 200%; padding-left: 10px;}
.tracker-item .caughtup { padding: 5px; margin: 0px 10px; border: 0px solid var(--border); border-radius: 100%;}
.tracker-item .myturn { padding: 5px; margin: 0px 10px; border: 0px solid var(--border); border-radius: 100%;}
.tracker-item * {text-indent: 0;}
.tracker-item hr { border: 0; height: 1px; background: transparent; margin: 5px 5%;}
.fizzhistorywrap + span[style="font-size: 90%;"] + script + span[style="font-size: 90%;"],
.fizzhistorywrap + span:not(:last-of-type)  {display: none;}
</style>`);

function loadJsFile(filename, ifNotExists, callback ) {
    if (!ifNotExists)  {
        let fileref = document.createElement('script')
        fileref.setAttribute("type", "text/javascript")
        fileref.setAttribute("src", filename)
        if (callback) {
            fileref.onreadystatechange = callback;
            fileref.onload = callback;
        }
        document.head.appendChild(fileref);
    } else if (callback) {
        callback();
    }
}

function createTrackerElements (params) {

    const Open_Thread_Wrapper = $("<div class='fizztrackerwrap'></div>");
    const Alt_Thread_Wrapper = $("<div class='fizztrackerwrap' style='display:none;'></div>");
    const Closed_Thread_Wrapper = $("<div class='fizzhistorywrap'></div>");
    $(params.currentScript).before(Open_Thread_Wrapper);
    $(params.currentScript).before(Alt_Thread_Wrapper);
    $(params.currentScript).before(Closed_Thread_Wrapper);

    let nameid = params.characterName.replace(/[^a-zA-Z]/g, '')
    params.thisTracker = "#track"+nameid;
    params.thisAltTracker = "#alt"+nameid;
    params.thisHistory = params.thisAltHistory = "#history"+nameid;

    Open_Thread_Wrapper.append(`<p>RPs Abertas <span style="font-size: var(--font2);"><i class="fa fa-undo"></i></span></p>`).on('click', 'p', RefreshParticipatedTracker(params));
    Alt_Thread_Wrapper.append(`<p>${params.altSectionTitle || "Other"}</p>`);
    Closed_Thread_Wrapper.append(`<p>RPs Encerradas</p>`);

    $(Open_Thread_Wrapper).append($(`<div id="track${nameid}"></div>`));
    $(Alt_Thread_Wrapper).append($(`<div id="alt${nameid}"></div>`));
    $(Closed_Thread_Wrapper).append($(`<div id="history${nameid}"></div>`));



    $(params.currentScript).before(``);
}

function TrackParticipatedThreads(params = {}) {
    if (window.trackernum === undefined) window.trackernum = 0;
    else trackernum++;
    params.trackernum = trackernum;
    const Is_Mobile = (document.getElementById("mobile") !== null);
console.log("tracker num ", trackernum)

    const scriptelements = document.getElementsByTagName("script");
    params.currentScript = scriptelements[scriptelements.length - 1];

    if (!params) {
        params = {};
    }
    if (!params.indicators) {
        params.indicators = ['<i class="fa fa-circle-o"></i>', '<i class="fa fa-circle-o"></i>'];
    }
    if (!params.lockedMacroIdentifier) {
        params.lockedMacroIdentifier = "[title*=Closed],[class*=lock],[class*=closed]";
    }
    if (!params.archiveForumNames) {
        params.archiveForumNames = ["Archives"];
    }
    if (!params.floodControl) {
        params.floodControl = 5;
    }
    if (!params.rowClass) {
        params.rowClass = ".post-normal"
    }

    loadJsFile('https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.js', window.jQuery, function() {
        if (!params.characterName) {
            params.characterName = $(params.currentScript).closest(`.mobile-post, ${params.rowClass}`).find("a[href*=showuser]").first().text().trim();
        }
        createTrackerElements(params, params.currentScript);
        loadJsFile('https://files.jcink.net/uploads2/malleficarum/autoTrackerMainProfile.js', window.FillTracker, function() {
            console.log(params.characterName, "tracker num ", params.trackernum,"timeout: ", params.floodControl * 1000 * params.trackernum )
            setTimeout(async () => {

                await FillTracker(params.characterName, params);
                if (Is_Mobile) $.get("/?act=mobile");
                if ($(params.thisAltTracker).text() != "None") $(params.thisAltTracker).parent().show();
                
            }, params.floodControl * 1000 * params.trackernum); 
            
        })
    });

}

function RefreshParticipatedTracker (params, Is_Mobile) {
    return function() {
        $(params.thisTracker).html('');
        $(params.thisAltTracker).html('');
        $(params.thisHistory).html('');
        setTimeout(async () => {
            await FillTracker(params.characterName, params);
            if (Is_Mobile) $.get("/?act=mobile");
            if ($(params.thisAltTracker).text() != "None") $(params.thisAltTracker).parent().show();
            
        }, 0); 
    }
}
