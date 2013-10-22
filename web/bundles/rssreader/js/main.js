function split( val ) {
    return val.split( /,\s*/ );
}
function extractLast( term ) {
    return split( term ).pop();
}

// -------------------------------- jQuery Extend ------------------------------------ //

jQuery.fn.extend({
    topMouseover: function(self) {
        this.on('mouseover',function() {
            self.opacity.stop().animate({opacity:"1"},300);
            self.button.stop().animate({opacity:"1"},300);
        });
    },
    topMouseout: function(self) {
        this.on('mouseout',function() {
            self.opacity.stop().animate({opacity:"0"},300);
            self.button.stop().animate({opacity:"0.4"},300);
        });
    },
    wScroll: function(g) {
        if(g == 0) this.removeClass("no-count");
        if(!this.hasClass("no-count")){
            if(g > 500 && this.is(":hidden")){
                this.addClass("visible");
                this.css("cursor","pointer");
                this.fadeIn(500);
                this.click(function(){
                    jQuery("body, html").animate({scrollTop:0},600);
                    this.fadeOut(300);
                    this.addClass("no-count");
                });
            }
            if(g < 200 && this.hasClass("visible")){
                this.removeClass("visible");
                this.fadeOut(300);
            }
        }else{
            this.unbind("click");
        }
    },
    autocompleteElement: function(source) {
        $(this).autocomplete({
            source: function( request, response ) {
                jQuery.getJSON( source, {
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
                return false;
            },
            select: function( event, ui ) {
                var terms = split( this.value );
                terms.pop();
                terms.push( ui.item.value );
                terms.push( "" );
                this.value = terms.join( "" );
                return false;
            }
        });
    }
});

// -------------------------------- jQuery Extend ------------------------------------ //






// -------------------------------- Objects ----------------------------------------- //

function toTopBtn(toTop, opacity, btn) {
    this.toTopBtn = jQuery(toTop);
    this.opacity = jQuery(opacity);
    this.button = jQuery(btn);
    this.windowScroll();
    this._init();
    return this;
}

toTopBtn.prototype = {
    _init: function () {
        var self = this;
        this.toTopBtn.topMouseover(self);
        this.toTopBtn.topMouseout(self);
    },
    windowScroll: function() {
        var g = jQuery(window).scrollTop();
        this.toTopBtn.wScroll(g);
    }
}


// --------------------------------------------------------------------------- //

function autoComplete(input,source) {
    this.field = jQuery(input);
    this.source = source;
    this._init();
    return this;
}

autoComplete.prototype = {
    _init: function() {
        this.field.bind( "keydown", function( event ) {
            if ( event.keyCode === jQuery.ui.keyCode.TAB &&
                jQuery( this ).data( "ui-autocomplete" ).menu.active ) {
                event.preventDefault();
            }
        });
        this.field.autocompleteElement(this.source);
    }
}


// -------------------------------- Objects ----------------------------------------- //








// --------------------------------- DOCUMENT READY --------------------------------- //

jQuery(document).ready(function() {


    upButton = new toTopBtn(".toTopWrapper",".toTopOpacity",".toTopBtn");

    jQuery(window).scroll(function(){
        upButton.windowScroll();
    });

    formTags = new autoComplete('#form_Tags',Routing.generate('get_tags'));



    // -------------------- AJAX FORMS INITIALIZATION ----------------------------- //


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


    // -------------------- AJAX FORMS INITIALIZATION  END ------------------------- //




    // ------------------------------ TRASH --------------------------------------------- //
    //var j = 0;
    //var i = 0;
    //var lastI = 0;
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
});
