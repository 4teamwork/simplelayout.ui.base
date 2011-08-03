var ajaxManager = jq.manageAjax.create('queuedRequests', {
    queue: true,
    cacheResponse: false
});



simplelayout.toggleEditMode = function(toggle){

    var $controls = jq('.sl-controls');
    var $slots = jq('.simplelayout-content [id*=slot]');
    var $view = jq('#contentview-view');
    var $edit = jq('#contentview-edit');
    var $preview = jq('#contentview-preview');

    //set edit_mode to zero when someone clicks on view or preview
    $view.bind('click', function(){
        createCookie('edit_mode','0');
    });
    $preview.bind('click', function(){
        createCookie('edit_mode','0');
    });


    //get the edit mode state from cookie
    simplelayout.edit_mode = readCookie('edit_mode');
    //set to 0 if null
    if (!simplelayout.edit_mode)
        simplelayout.edit_mode = "0";

    if (toggle) {
        simplelayout.edit_mode=="0" ? simplelayout.edit_mode = "1" : simplelayout.edit_mode = "0";
        createCookie('edit_mode',simplelayout.edit_mode);
        }


    if(simplelayout.edit_mode=="1" && $controls.length != 0){
        var uids = [];
        $controls.each(function(){
                var element_id = jq(this).closest('.BlockOverallWrapper').attr('id');
                if (element_id != undefined && (element_id.length === 36 || element_id.length === 40))
                    uids.push(element_id);
                       });
        jq.post(getBaseUrl()+'sl_get_block_controls', {'uids': uids.join(',')},function(data){
            //first element is the container controls area
                  jq(jq('.sl-controls').get(0)).html(data.container).each(
                    function() {
                      if(jq(this).html().replace(/\s/gi, '').length > 0) {
                        // only show if there are any controls
                        jq(this).show('slow');
                      }
                    });
            jq.each(data.items, function(i,item){
                var target = jq('#'+item.id+' .sl-controls');
                //load controls
                if (item.data.replace(/\s/gi, '').length)
                    target.html(item.data);

                //show controls div
                target.show();
                var $block = target.closest('.BlockOverallWrapper');
                if (!$block.hasClass("blockHighlight"))
                    $block.addClass("blockHighlight");

            });

            //add borders
            if (!$slots.hasClass("highlightBorder"))
                $slots.addClass("highlightBorder");

            //edit is selected
            if (!$edit.hasClass("selected"))
                    $edit.addClass("selected");
            $view.removeClass("selected");

            //expose edit area
            //enable later
            //simplelayout.expose().load();

            jq(".simplelayout-content").trigger('actionsloaded');

        },'json');

        // init empty block spaces
        setHeightOfEmptyDropZone();

    }else{
        var blocks = jq('.BlockOverallWrapper');
        blocks.removeClass("blockHighlight");
        $slots.removeClass("highlightBorder");
        $controls.hide("slow");
        $controls.html('&nbsp;');
        //view is selected
        if (!$view.hasClass("selected"))
                $view.addClass("selected");

        $edit.removeClass("selected");

        //expose edit area
        //enable later
        //simplelayout.expose().close();

    }

    var imgblocks = jq('.BlockOverallWrapper.image');
    for (var b=0;b<imgblocks.length;b++) {
        var query_controls = '#'+imgblocks[b].id + ' .sl-controls';
        var controls_el = jq(query_controls)[0];
        simplelayout.setControlsWidth(controls_el);
    }

    $edit.trigger('toggle-edit-mode');


}

/* not really intuitive so far */
/*
simplelayout.expose = function(){
    var editable = jq('#portal-columns');
    var exposed =  editable.expose({api: true,
                                    opacity: 0.3,
                                    color:'black',
                                    zIndex:2000});

    return exposed;
}

*/

function gup( name, url )
{
  name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
  var regexS = "[\\?&]"+name+"=([^&#]*)";
  var regex = new RegExp( regexS );
  if (typeof url == "undefined") {
      url = window.location.href;
      }
  var results = regex.exec( url );
  if( results == null )
    return "";
  else
    return results[1];
}

function getBaseUrl(){
    var bhref= base_href = jq('base')[0].href;
    if(bhref.substr(bhref.length-1,1)!='/'){
        bhref += "/";
        }
    return bhref;

}

simplelayout.refreshParagraph = function(item){
    //var item = this;
    var a_el = jq('a', item);
    var id = a_el[0].id.split("_");
    var uid = id[0];
    //outch we have to change this asap - it makes no sense
    var layout = id[1];
    var cssclass = id[2];
    var viewname = id[3];
    if (cssclass==undefined){
        cssclass = '';
    }
    if (viewname==undefined){
        viewname = '';
    }

    var fieldname = gup('fieldname',a_el[0].href);

    ajaxManager.add({url:'sl_ui_changelayout',
                            data:{ uid : uid, layout :layout,viewname:viewname,fieldname:fieldname },
                            success:function(data){
                                jq('#uid_' + uid +' .simplelayout-block-wrapper').replaceWith(data);
                                jq('#uid_' + uid +' .active').removeClass('active');
                                jq(item).addClass('active');
                                simplelayout.alignBlockToGridAction();
                                simplelayout.setControlsWidth(item);
                                //trigger refreshed event
                                var $wrapper = jq(item).closest('.BlockOverallWrapper');
                                jq(".simplelayout-content:first").trigger('refreshed',[$wrapper]);

                                }
                            });
    return 0;

};

simplelayout.setControlsWidth = function(item){
    var imgblock = jq(item).closest('.BlockOverallWrapper.image');
    if (imgblock.length != 0) {
        // Get wrapper width
        var wrapper_width = jq('.sl-img-wrapper', imgblock).width();
        var controls_el = jq('.sl-controls', imgblock);
        controls_el.css('width',wrapper_width+'px');
    }
    return 0;
}


function activeSimpleLayoutControls(){
    jq(".sl-layout").bind("click", function(e){
            e.stopPropagation();
            e.preventDefault();

            simplelayout.refreshParagraph(this);

        });

}


function activateSimplelayoutActions(){
    // delete
    jq('.simplelayout-content a.sl-delete-action').each(function(i, o){
        var $this = jq(o);
        var uid = $this.closest('.BlockOverallWrapper').attr('id');
        $this.prepOverlay({
            subtype:'ajax',
            urlmatch:'$',urlreplace:' #content > *',
            formselector:'[action*=delete_confirmation]',
            noform:function(){
                //remove deleted block manually, because we won't reload the
                //hole page
                jq('#'+uid).hide('blind',function(){
                    jq(this).remove();
                });
                return 'close';
            },
            'closeselector':'[name=form.button.Cancel]'
        });
    });

    // TODO: Currently we miss some js after loading de edit.pt in the overlay
    // Example: WYSIWYG-editor will no load...
    // I tried to use subtype iframe, wihtout success
    //edit
    // jq('.simplelayout-content a.sl-edit-action').each(function(i, o){
    //     var $this = jq(o);
    //     $this.prepOverlay({
    //         subtype:'ajax',
    //         filter:'#visual-portal-wrapper > *',
    //         formselector:'[action*=base_edit]',
    //         noform:function(){
    //             simplelayout.refreshParagraph(
    //                 $this.closest('.BlockOverallWrapper').find('.sl-layout.active')
    //             );
    //
    //             return 'close';
    //         },
    //         'closeselector':'[name=form.button.cancel]'
    //     });
    // });
    // return false;


}

jq(function(){
    jq(".simplelayout-content:first").bind("actionsloaded", activateSimplelayoutActions);
    jq(".simplelayout-content:first").bind("actionsloaded", activeSimpleLayoutControls);

// XXX initializeMenus is a toggle and is already called by plone
//     jq(".simplelayout-content:first").bind("actionsloaded", function(){initializeMenus();});

    //toggleEditMode it checks if we are on edit mode or not
    simplelayout.toggleEditMode(toggle=false);

    //bind click event on edit-button
    jq('#contentview-edit a').bind('click',function(e){
        e.stopPropagation();
        e.preventDefault();
        simplelayout.toggleEditMode(toggle=true);
    });
});
