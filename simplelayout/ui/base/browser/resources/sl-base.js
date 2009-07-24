var ajaxManager = jq.manageAjax.create('queuedRequests', { 
    queue: true,  
    cacheResponse: false 
}); 



jq(function(){
    //XXX refactor - if there is more than one simplelayout-content class present
    //the event will binded twice, so far we bind the first on we get
    jq(".simplelayout-content").eq(0).bind("toggleeditmode", function(){
        if(!simplelayout.edit_mode || simplelayout.force_edit_mode){
            var uids = [];
            jq('.sl-controls').each(function(){
                    var element_id = jq(this).closest('.BlockOverallWrapper').attr('id');
                    if (element_id != undefined && element_id.length == 36)
                        uids.push(element_id);
            })
            jq.post(getBaseUrl()+'sl_get_block_controls', {'uids': uids.join(',')},function(data){
                jq(jq('.sl-controls').get(0)).html(data.container);
                jq.each(data.items, function(i,item){
                    var target = jq('#'+item.id+' .sl-controls')
                    target.html(item.data);
                });  
                jq('.sl-controls').show();
                jq(".simplelayout-content").trigger('actionsloaded');
                simplelayout.edit_mode = 1;
                simplelayout.force_edit_mode = 0;
            },'json');
        }else{
            jq('.sl-controls').html('&nbsp;');
            simplelayout.edit_mode = 0;
        }
    })
})

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
    return  bhref

}

function refreshParagraph(item){
    //var item = this;
    var a_el = jq('a', item);
    var id = a_el[0].id.split("-");
    var uid = id[0];
    //outch we have to change this asap - it makes no sense
    var layout = id[1];
    var cssclass = id[2] ? '-' +id[2] : '';
    
    layout = layout + cssclass;
    var fieldname = gup('fieldname',a_el[0].href);
    
    ajaxManager.add({url:'sl_ui_changelayout',
                            data:{ uid : uid, layout :layout,fieldname:fieldname },
                            success:function(data){
                                jq('#uid_' + uid +' .simplelayout-block-wrapper').replaceWith(data);
                                jq('#uid_' + uid +' .active').removeClass('active');
                                jq(item).addClass('active');
                                alignBlockToGridAction();
                                }
                            });
    
/*    
    jq.post('sl_ui_changelayout', { uid : uid, layout :layout,fieldname:fieldname }, function(data){
        jq('#uid_' + uid +' .simplelayout-block-wrapper').replaceWith(data);
        jq('#uid_' + uid +' .active').removeClass('active');
        jq(item).addClass('active');
        alignBlockToGridAction();
    });
*/
    
    ajaxManager
    
    return 0
    
}


function activeSimpleLayoutControls(){
    jq(".sl-layout").bind("click", function(e){
            e.stopPropagation();
            e.preventDefault();
            
            refreshParagraph(this);

        });

}


function activateSimplelayoutActions(){
    jq('.simplelayout-content a.sl-delete-action').bind('click',function(e){
            e.preventDefault();
            var html = jq('<div class="delete_confirmation_popup"></div>');
            id = this.id;
            el = this;
            var obj_url = getBaseUrl()+id;
            html.load(obj_url+'/sl_delete_action_popup');
            
            
            jq(html).dialog({
                title: 'Entfernen', 
                modal: true, 
                draggable: false,
                width: 450,
                show:"puff",
                hide:"puff",
                resizable:false,
                overlay: {  
                    opacity: 0.6,  
                    background: "black"  
                    }, 
                buttons: {  
                    "Ok": function() {  
                    jq.post(obj_url+'/sl_delete_object',{ },function(data){
                        if (data){
                            //remove entry  
                            jq(el).closest('.BlockOverallWrapper').hide('blind',function(){
                                    jq(this).remove()
                                });
                            }
                        });
                    jq(this).dialog("close");  
                    },  
                "Cancel": function() {  
                    jq(this).dialog("close");  
                    }}}); 
                    
        })
        
}

jq(function(){
    jq(".simplelayout-content").bind("actionsloaded", activateSimplelayoutActions);
    jq(".simplelayout-content").bind("actionsloaded", activeSimpleLayoutControls);
    jq(".simplelayout-content").bind("actionsloaded", function(){initializeMenus();});
    
});
