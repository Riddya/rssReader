jQuery.fn.extend({
    inputKeydown: function() {
        var col = 0;
        var flag = 0;
        $(this).on("keydown",function(event) {
            if (event.keyCode != 8) {
                if (flag == 1) {
                    flag = 0;
                    jQuery("div.tag").last().css('background-color',"white");
                }
                if (col == 5) {
                    alert("There must be no more than 5 tags!");
                    return false;
                }
            }

            if (event.keyCode == 8 && jQuery(this).val() == '') {
                if (jQuery("div.tag").length){
                    if (flag == 0) {
                        jQuery("div.tag").last().css("background-color","#e0ffff");
                        flag = 1;
                    } else {
                        flag = 0;
                        temp = jQuery("div.tag").last().width();
                        jQuery("div.tag").last().remove();
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
                    html = '<div class="tag">'+text+'</div>';
                    jQuery(html).insertBefore(this);
                    jQuery(this).css('width',inputWidth-(jQuery("div.tag").last().width()+16)+'px').val('');
                    col++;
                    return false;
                }
            }
        });
    },
    inBlockClick: function(self) {
        self.text = jQuery(this).text().toString();
        self.width = self.upper.width();
        jQuery(this).attr("contenteditable",true);
        jQuery(this).focus();
    },
    inBlockKeydown: function(self) {
        input = self.upper;
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
            jQuery(this).text(self.text);
            input.width(self.width);
            jQuery(this).blur();
            input.focus();
            return true;
        }
        if (jQuery(this).text().length == 10) {
            return false;
        }
        input.css("width",(input.width()-10)+'px');
    }
});


// -------------------------------------- OBJECTS ------------------------------------- //


// -------------------------------------------------------------------------- //

function tagsInput(input) {
    this.field = jQuery(input);
    this._init();
    return this;
}

tagsInput.prototype = {
    _init: function() {
        this.field.inputKeydown();
    }
}

// ---------------------------------------------------------------------- //

function inputBlocks(cls,par) {
    this.text = '';
    this.width = 0;
    this.upper = jQuery(par);
    this.block = cls;
    this._init();
    return this;
}

inputBlocks.prototype = {
    _init: function() {
        var self = this;
        jQuery(document).on("click",this.block, function() {
            $(this).inBlockClick(self);
        });
        jQuery(document).on("keydown",this.block, function(event) {
            $(this).inBlockKeydown(self);
        });
    }
}


jQuery(document).ready(function() {

    tagw = new tagsInput("#tagInput");

    blocks = new inputBlocks(".tag","#tagInput");

    tagInput = new autoComplete('#tagInput',Routing.generate('get_tags'));

});