jQuery.fn.extend({
    dropRss: function(event,ui) {
        var tags = [];
        anchor = 0;
        tag = $(ui.draggable).find("a").html();
        rssId = $(this).data("rssId");
        $(this).parent().children('.rss_tags').each(function() {
            tags.push($(this).html());
        });
        for (i = 0; i< tags.length; i++) {
            if (tags[i] == tag) {
                anchor = 1;
            } else {

            }
        }
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
                    html = "<div class = 'rss_tags' data-tag-name='"+tag+"'>"+tag+"</div>";
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
    },
    dropCloud: function(event,ui) {
        jQuery(ui.draggable).css('display','none');
        tag = jQuery(ui.draggable).html();
        rssId = jQuery(ui.draggable).parent().children(".rss_name").data("rssId");
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



// --------------------------------------------- //

function droppableRss(drop,accept,activeClass,hoverClass) {
    this.dropElement = jQuery(drop);
    this.allowed = accept;
    this.activeStyle = activeClass;
    this.hoverActive = hoverClass;
    this._init();
    return this;
}

droppableRss.prototype = {
    _init: function() {
        var self = this;
        this.dropElement.droppable({
            accept: self.allowed,
            activeClass: self.activeStyle,
            hoverClass: self.hoverActive,
            drop: function(event,ui) {
                $(this).dropRss(event,ui);
            }
        });

    },
    dragElements: function() {
        jQuery(document).on("mouseover",this.allowed, function() {
            jQuery(this).draggable({helper: "clone", revert: "invalid", cursor: "pointer"}).enable();
        });
    }
}


// ------------------------------------------------------------ //


function droppableCloud(drop,accept,activeClass,hoverClass) {
    this.dropElement = jQuery(drop);
    this.allowed = accept;
    this.activeStyle = activeClass;
    this.hoverActive = hoverClass;
    this._init();
    return this;
}

droppableCloud.prototype = new droppableRss();

droppableCloud.prototype._init = function() {
    var self = this;
    this.dropElement.droppable({
        accept: self.allowed,
        activeClass: self.activeStyle,
        hoverClass: self.hoverActive,
        drop: function(event,ui) {
            $(this).dropCloud(event,ui);
        }
    });
}


$(document).ready(function() {
    rssNames = new droppableRss('.rss_name','.tagDraggable','dropActive','dropHover');
    rssNames.dragElements();

    cloud = new droppableCloud('.cloud','.rss_tags','cloudActive','cloudHover');
    cloud.dragElements();
});

// --------------------------------------------------------------------------- //