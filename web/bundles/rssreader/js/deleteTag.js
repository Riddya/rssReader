function deleteTag(image) {
    this.img = image;
    this._init();
    return this;
}

deleteTag.prototype = {
    _init: function() {
        jQuery(document).on("click",this.img, function() {
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
    }
}


jQuery(document).ready(function() {
    deleteImages = new deleteTag(".delete_img");
});