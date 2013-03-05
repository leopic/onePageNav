$.widget('bc.onePageNav', {
    options: {
        threshold: 500,
        baseClassName: 'ui-onepagenav',
        activeClass: 'active',
        useHashes: true,
        menuElement: ''
    },
    _create: function () {
        var self = this,
            options = self.options,
            didScroll = false;

        self.$items = $(self.element.find('.' + options.baseClassName + '-anchor'));

        // if the user provided and element
        if (!!options.menuElement) {
            self.$menu = $(options.menuElement);
        } else {
            self.$menu = $('<div />');
        }

        self.positionCol = [];
        self.positionName = [];

        self._buildMenu();
        self._clickHandler();

        // http://ejohn.org/blog/learning-from-twitter/
        $(window).on('scroll', function() {
            didScroll = true;
        });

        setInterval(function(){
            if (didScroll) {
                self._updOnCurrentPos();
                didScroll = false;
            }
        }, 250);

        self._updOnCurrentPos();
    },
    _buildMenu: function () {
        var self = this,
            $el = self.element,
            $menu = self.$menu,
            options = self.options;

        // getting the name of all anchors
        self.$items.each(function(i, el) {
            self.positionName.push('#' + $(el).attr('id'));
        });

        // items might've loaded, stuff happened
        self._recalculatePositions();

        // creating the menu element
        $menu.addClass(options.baseClassName + '-menu').append('<ul></ul>');

        // adding all links into the menu
        self.$items.each(function (i, el) {
            var $el = $(self.$items.get(i)),
                $template = $('<li><a>link</a></li>'),
                itemName;

            itemName = $el.data('onepagenav-name') || $el.attr('id');

            $template.addClass(options.baseClassName + '-item').find('a').attr('href', '#' + $el.attr('id')).text(itemName)
                .addClass(options.baseClassName + '-link')
                .addClass(options.baseClassName + '-' + itemName.toLowerCase().replace(' ', '-'))
                .end().appendTo($menu.find('ul'));
        });

        // appending the menu to the page
        $menu.appendTo($el).fadeIn();
    }, _clickHandler: function(){
        var self = this,
            $menu = self.$menu,
            options = self.options;

        // on click for all links
        $menu.find('a').on('click', function (event) {
            var $el = $(this),
                idx = _.indexOf(self.positionName, $el.attr('href'));

            // default behavior is jumpy
            event.preventDefault();
            self._recalculatePositions();
            self._trigger('beforeScroll', event);

            $('body').animate({ scrollTop: self.positionCol[idx]}, 600, function() {
                $menu.find($el).parent().siblings().removeClass(options.activeClass).end().addClass(options.activeClass);
                if (options.useHashes) {
                    window.location.hash = self.positionName[idx];
                }
                self._trigger('afterScroll', event);
            });
        });
    }, _updOnCurrentPos: function () {
        var self = this,
            options = self.options,
            $menu = self.$menu,
            floor,
            ceil,
            i,
            currentPosition = $(window).scrollTop();

        self._recalculatePositions();

        for (i = 0; i < self.positionCol.length; i++) {
            floor = self.positionCol[i] - options.threshold;
            ceil = self.positionCol[i] + options.threshold;

            if (floor < currentPosition && currentPosition < ceil) {
                $menu.find('a[href="' + self.positionName[i] + '"]').parent().addClass(options.activeClass)
                     .siblings().removeClass(options.activeClass);
                break;
            }
        }
    }, _recalculatePositions: function () {
        var self = this,
            options = self.options;

        // emptying the array
        self.positionCol.splice(0, self.positionCol.length);

        // updating all positions
        self.$items.each(function(i, el) {
            self.positionCol.push($(el).offset().top);
        });
    }
});


