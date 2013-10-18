function split( val ) {
    return val.split( /,\s*/ );
}
function extractLast( term ) {
    return split( term ).pop();
}

jQuery(document).ready(function() {

    jQuery(".to_top").each(function(){
        jQuery(this).mouseover(function(){
            jQuery(".to_top_opacity").stop().animate({opacity:"1"},300);
            jQuery(".to_top_button").stop().animate({opacity:"1"},300);
        });
        jQuery(this).mouseout(function(){
            jQuery(".to_top_opacity").stop().animate({opacity:"0"},300);
            jQuery(".to_top_button").stop().animate({opacity:"0.4"},300);
        });
    });

    jQuery(window).scroll(function(){
        var g = jQuery(window).scrollTop();
        if(g == 0) jQuery(".to_top").removeClass("no-count");

        if(!jQuery(".to_top").hasClass("no-count")){
            if(g > 500 && jQuery(".to_top").is(":hidden")){
                jQuery(".to_top").addClass("visible");
                jQuery(".to_top").css("cursor","pointer");
                jQuery(".to_top").fadeIn(500);
                jQuery(".to_top").click(function(){
                    jQuery("body, html").animate({scrollTop:0},600);
                    jQuery(".to_top").fadeOut(300);
                    jQuery(".to_top").addClass("no-count");
                });
            }
            if(g < 200 && jQuery(".to_top").hasClass("visible")){
                jQuery(".to_top").removeClass("visible");
                jQuery(".to_top").fadeOut(300);
            }
        }else{
            jQuery(".to_top").unbind("click");
        }
    });
    /*jQuery("#rss_add").ajaxForm({
        clearForm: true,
        target: "body",
        success: function() {
        }
    });*/
    jQuery("#rss_edit").ajaxForm({
        beforeSend: function() {
            $("#loadingGif").css('display','inline');
        },
        success: function() {
            alert("Data successfully changed!");
            $("#loadingGif").css('display','none');
        }
    });
    jQuery("#add_tag").ajaxForm({
        clearForm: true,
        target: ".tags",
        beforeSend: function() {
            $("#loadingGif").css('display','inline');
        },
        success: function() {
            $("#loadingGif").css('display','none');
        }
    });

    jQuery("#cloud #draggable").each(function() {
        jQuery(this).draggable({helper: "clone", revert: "invalid",
            drag: function( event, ui ) {
            }
        }).enable();
    });

    jQuery( "#tmp #droppable" ).each(function() {
        jQuery(this).droppable({
            accept: "#draggable",
            activeClass: "dropActive",
            hoverClass: "dropHover",
            activate: function(event,ui) {
            },
            drop: function( event, ui ) {
                tags = new Array();
                anchor = 0;
                tag = $(ui.draggable).find("a").html();
                rssId = $(this).data("rssId");
                $(this).parent().children('#dragToDelete').each(function() {
                    tags.push($(this).html());
                });
                tags.forEach(function(item) {
                    if (item == tag) {
                        anchor = 1;
                    } else {

                    }
                });

                if (anchor == 1) {
                    $(ui.draggable).draggable({revert: true});
                } else {
                    $(ui.draggable).draggable({revert: false});
                    $.ajax({
                        url: Routing.generate('add_tag', {'name' : tag, 'id' : rssId}),
                        beforeSend: function() {
                            $("#loadingGif").css('display','inline');
                        },
                        success: function() {
                            $("#loadingGif").css('display','none');
                            tags.push(tag);
                            html = "<div id='dragToDelete' class = 'rss_tags' data-tag-name='"+tag+"'>"+tag+"</div>";
                            last = $("div[data-rss-id = "+rssId+"]").parent();
                            $(html).appendTo(last);
                        },
                        error: function(jqXHR, textStatus, errorThrown) {
                            alert(jqXHR);
                            alert(textStatus);
                            alert(errorThrown);
                        }
                    });
                }
            }
        });
    });

    jQuery("#tmp").on('mouseover',"#dragToDelete",function() {
        jQuery(this).draggable({revert: "invalid", helper: "clone", cursor: "pointer"}).enable();
    });

    jQuery("#cloud").droppable({
        accept: "#dragToDelete",
        activeClass: "cloudActive",
        hoverClass: "cloudHover",
        drop: function( event, ui ) {
           jQuery(ui.draggable).css('display','none');
            tag = jQuery(ui.draggable).html();
            rssId = jQuery(ui.draggable).parent().children("#droppable").data("rssId");
            $.ajax({
                url: Routing.generate('remove_tag', {'name' : tag, 'id' : rssId}),
                beforeSend: function() {
                    $("#loadingGif").css('display','inline');
                },
                success: function() {
                    $("#loadingGif").css('display','none');
                    jQuery(ui.draggable).remove();
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    alert(jqXHR);
                    alert(textStatus);
                    alert(errorThrown);
                }
            });
        }
    });

    function strip(html) {
        var tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        return tmp.textContent||tmp.innerText;
    }


    var j = 0;
    var i = 0;
    var lastI = 0;
    var flag = 0;
    var col = 0;
    var text = '';
    var width = 0;
    jQuery("#tagInput").on("keydown",function(event) {
        if (event.keyCode != 8) {
            if (flag == 1) {
                flag = 0;
                jQuery("div#indexTag").last().css('background-color',"white");
            }
            if (col == 5) {
                alert("There must be no more than 5 tags!");
                return false;
            }
        }

        if (event.keyCode == 8 && jQuery(this).val() == '') {
            if (jQuery("div#indexTag").length){
                if (flag == 0) {
                    jQuery("div#indexTag").last().css("background-color","#e0ffff");
                    flag = 1;
                } else {
                    flag = 0;
                    temp = jQuery("div#indexTag").last().width();
                    jQuery("div#indexTag").last().remove();
                    jQuery(this).css('width',jQuery(this).width()+(temp+16)+'px').val('');
                    col--;
                }
            } else {
                return 0;
            }
        }
        if (event.keyCode == 13 || event.keyCode == 188) {
            if (col != 5) {
                inputWidth = jQuery(this).width();
                text = jQuery(this).val();
                html = '<div id="indexTag" class="tag">'+text+'</div>';
                jQuery(html).insertBefore(this);
                jQuery(this).css('width',inputWidth-(jQuery("div#indexTag").last().width()+16)+'px').val('');
                col++;
                return false;
            }
        }
    });

    jQuery(this).on("click","#indexTag",function() {
        text = jQuery(this).text().toString();
        width = jQuery(this).parent().children("input").width();
        jQuery(this).attr("contenteditable",true);
        jQuery(this).focus();
    });
    jQuery(this).on("keydown","#indexTag",function(event) {
        input = jQuery(this).parent().children("input");
        if (event.keyCode == 8) {
            if (jQuery(this).text() == "") {
                jQuery(this).remove();
                input.focus();
            } else {
                input.css("width",(input.width()+6)+'px');
                return true;
            }
        }
        if (event.keyCode == 116) {
            return true;
        }
        if (event.keyCode == 13) {
            jQuery(this).blur();
            input.focus();
            return true;
        }
        if (event.keyCode == 27) {
            jQuery(this).text(text);
            input.width(width);
            jQuery(this).blur();
            input.focus();
            return true;
        }
        if (jQuery(this).text().length == 10) {
            return false;
        }
        input.css("width",(input.width()-10)+'px');
    });

    /*jQuery("#op").on("keydown",function(event) {
        if (event.keyCode != 8) {
            if (flag == 1) {
                flag = 0;
                $("div#zhopa").last().css('background-color',"white");
            }
            j+=7;
        } else if (event.keyCode == 8 && $(this).val() != '') {
            j-=7;
        } else if (event.keyCode == 8 && $(this).val() == '') {
            if (flag == 0){
                if ($("div#zhopa").length) {
                    $("div#zhopa").last().css('background-color',"#e0ffff");
                    flag = 1;
                } else {
                    $(this).css('width',300+'px').val('');
                }
            } else {
                temp = $("div#zhopa").last().width();
                inputWidth = $(this).width();
                $("div#zhopa").last().remove();
                if (inputWidth >= 294 && inputWidth <= 300) {
                    dif = 300 - inputWidth;
                    $(this).parent().children("br").last().remove();
                    $(this).css('width',(temp+(300-lastI+18+dif))+'px').val('');
                    flag = 0;
                } else {
                    $(this).css('width',$(this).width()+(temp+12)+'px').val('');
                    flag = 0;
                }
            }
            $("div#zhopa").last().focus();
        }
        if (event.keyCode == 13 || event.keyCode == 188) {
            j += 7;
            inputWidth = $(this).width();
            text = $(this).val();
            if (inputWidth < j) {
                if (j < (300 - i)) {
                    html = '<div id="zhopa" class="xz">'+text+'</div><br>';
                    $(html).insertBefore(this);
                    i=0;
                    $(this).css('width',300+'px').val('');
                }
                else {
                    html = '<div id="zhopa" class="xz">'+text+'</div>';
                    $(html).insertBefore(this);
                    $(this).css('width',300-($("div#zhopa").last().width()+14)+'px').val('');
                    i = 0 + $("div#zhopa").last().width()+14;
                }
            }
            else {
                html = '<div id="zhopa" class="xz">'+text+'</div>';
                $(html).insertBefore(this);
                i += $("div#zhopa").last().width()+14;
                $(this).css('width',inputWidth-($("div#zhopa").last().width()+14)+'px').val('');
            }
            if ($(this).width() < 60) {
                lastI = i;
                html = '<br>';
                $(html).insertBefore(this);
                $(this).css('width',300+'px').val('');
                i = 0;
            }
            j = 0;
            return false;
        }
    });*/


    jQuery(this).on("click",".delete_img",function() {
            id = jQuery(this).data('tagId');
        jQuery.ajax({
                url: Routing.generate('delete_tag', {'id' : id}),
                beforeSend: function() {
                    $("#loadingGif").css('display','inline');
                },
                success: function(content) {
                    jQuery('img[data-tag-id = '+id+']').parent().css('display','none');
                    jQuery("#loadingGif").css('display','none');
                },
                error: function() {
                    alert(Routing.generate('delete_tag', {'id' : id}));
                }
            });
    });


    jQuery( "#form_Tags, #tagInput" )
        // don't navigate away from the field on tab when selecting an item
        .bind( "keydown", function( event ) {
            if ( event.keyCode === jQuery.ui.keyCode.TAB &&
                jQuery( this ).data( "ui-autocomplete" ).menu.active ) {
                event.preventDefault();
            }
        })
        .autocomplete({
            source: function( request, response ) {
                jQuery.getJSON( Routing.generate('get_tags'), {
                    term: extractLast( request.term )
                }, response );
            },
            search: function() {
                // custom minLength
                var term = extractLast( this.value );
                if ( term.length < 2 ) {
                    return false;
                }
            },
            focus: function() {
                // prevent value inserted on focus
                return false;
            },
            select: function( event, ui ) {
                var terms = split( this.value );
                // remove the current input
                terms.pop();
                // add the selected item
                terms.push( ui.item.value );
                // add placeholder to get the comma-and-space at the end
                terms.push( "" );
                this.value = terms.join( "" );
                return false;
            }
        });




});
