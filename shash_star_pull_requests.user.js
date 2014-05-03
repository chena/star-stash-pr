// ==UserScript==
// @name         Stash Starred Pull Requests 
// @match        https://stash.seekersolutions.com/*/pull-requests*
// @exclude      https://stash.seekersolutions.com/*/pull-requests/\d+/*
// @description  Track favourite pull requests on Stash.
// ==/UserScript==

// user-script hack for running main script in correct context
(function bootstrap(callback) {
    var mainScript = document.createElement('script');
    mainScript.textContent = '(' + callback.toString() + ')(jQuery);';
    document.body.appendChild(mainScript);
})(__main__);

/**
* NOTE: On page load, Stash only loades certain number of PR unless query param "limit" is specified.
* In order to star a merged pull request that is old, we need to set that param. 
* Once the item is starred, it's visible under the Starred tab.
* TODO: add a "Show More" trigger to see more or all pull requests 
*/
function __main__($) {
    var doc,
        tables,

        colour_star = [
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/',
            '9hAAACg0lEQVR42mNkwAP2TnWK/f3n302P/AOncKlhxCWxqdNQyMLJ/dGzRw/OGQ',
            'SvsCPZgEMzTSttvIPafn398H/flp3mXsUXThNtwKZuDVZjY9X7UkrK0iD++WNnlx',
            'tFHY4i2oBjc/VizW10FzExMzL8/8/I8Pn9l98nj99Sdsu/+hjDgEW5ElZ8ApxKvA',
            'JcUly87NI8fKzSkjJ8jkLCHEIQ84GGAPGzh+9vPXv65fS3T9+f/f7+4+nH91+eff',
            'r86wLjtSUGn5W1+HgYGYHKmBgZGBmZgHqYgDQjA8IABob/f78z/P/9geH/n58M//',
            '79B7qMiWHb5vfHGBfmSZpZ2khukVNkFQUbwISkGUT//wfU+A5owDcg8x9E8z9Ghv',
            'On/5289+CbDzgMFhdJqZqZS+yQU2RWAruEEab5L8P/Xy+AGv4wMPwDIpBh/9kZzp',
            'xi3Hrv0bewpClvv8EDcU29vIShoeh2SYn/BgxgXwNt+/kUqOs3WB6ol+E/IyfDuU',
            'vs8x8++pYW1/fqD0YsHJ+tGa2nw7fk/78fDP9/Am3+8wUu9x8YEH8YRBlOXvgr7l',
            'X++BXWaDw8VadXT5uxiAFowL8fjxAS/yEGMLEKMpw4y+jlUfV8O1YDjk/VOKKhwW',
            'z9D2z7R6AGEaBOYKj//gI2BRTyl26INjhXPG3EMGBCnCCrs6PYB2kZFq6/358zPH',
            'jMdfXZm39lnFysKvLiv+sF+d4J/f/7i+HaLYHtjpXvvDAM6ArlMYxLUDr38vnPd9',
            'evvWv4/O339NQZH8ABtbhASFiIl7FRXflX+us3fz9YlnwTxTCgJ4JXTEKYPf3H73',
            '/TUma9e4stiU+PZ9dlY2H0S577oxUmBgDomR6MfeDtLwAAAABJRU5ErkJggg=='
        ].join(''),

        grey_star = [
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAQAAAC1+j',
            'fqAAAAAmJLR0QA/4ePzL8AAAAJcEhZcwAAAEgAAABIAEbJaz4AAAFVSURBVCjPdZ',
            'FNKIRRFIaf+41RZgYZ0/iZpIaNMgvElGxkFopSslCSjSiSkJUUa0mxsLRiYSEbGx',
            'ulTEn5WVDsyIyFmshnfu/9rsVM+WYx59TpnLfnLM55oSj2J/d6KB1b3hvz5LJYM+',
            'xD9azf3da3010C2HK2zEvKRd1SCcA7Xh/IkSU4ttv0r4qV3upgVaMn4Ak09Hu9ef',
            'H95ePGjKdjX3HzXhz9tHoEBgKBKGwpckgs4Dxq3A68fiokinyVpEiSRSK5vU6OOK',
            'Kx4Kl7qLJGo9EoUgVY83D2Nrzz7YCrROjYHXHVayxSSCws4OkgPrGdAQfAhRkxfa',
            'MWaXJYWFho4oMbP7YzZWeWLGlkIUF3Ff1BhBVpFAYCiSKF0WMDpp0VHRrFx+Pd0P',
            'OimdAodDgPlAFk2n2uWOJ543d/T8LqYeVm86zT7siUf3l9odbuwExobi3f/QEXYY',
            'XV7NWeRQAAADB0RVh0Y29tbWVudABFZGl0ZWQgd2l0aCBMdW5hUGljOiBodHRwOi',
            '8vbHVuYXBpYy5jb20vvQoy3AAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAxMy0wNS0xMF',
            'QxNzowMTo0NS0wNzowMGhvwp8AAAAldEVYdGRhdGU6bW9kaWZ5ADIwMTMtMDUtMT',
            'BUMTc6MDE6NDUtMDc6MDAZMnojAAAAAElFTkSuQmCC'
        ].join('');

    $(function() {
        // emit message and bind to pre-existing elements
        console.log('Starting userscript "Stash Starred Pull Requests"...');
        doc = $(document);
        tables = $('#pull-requests-table');

        // attach event handlers for adding and removing starred pull requests
        doc.on('click', 'a.star-trigger', toggleStarredItems);

        // attach event handlers for displaying starred pull request tab
        doc.on('click', 'a#starred-pr-tab-navigate', navigateToStarredTab);

        // detect the query param on document ready
        // navigate to the starred tab if location is '?state=starred'
        doc.ready(function () {
            if (location.search == '?state=starred') {
                $('#starred-pr-tab-navigate').trigger('click');
            }
        });

        // reloads page for a popstate event from window.history
        // ie. clicking the back button from '?state=starred'
        $(window).on('popstate', function() {
            location.reload();
        });

        // append interactive elements and perform initial update
        if (tables.length > 0) {
            console.log('I see a PR table!');
            createStarredMenuTab();
            createInlineHooks();
            addExistingStarredItems();
        }

    });
    return;

    /**
     * BEGIN: STARTUP-ONLY FUNCTIONS
     */

    function createInlineHooks() {
        tables.find('td.title')
            .append('<a href="#" class="star-trigger"><img></a>')
            .find('.star-trigger')
                .css({ float: 'right' })
                .find('img')
                    .attr('src', grey_star);
    }

    function addExistingStarredItems() {
        var find_starred_row = function() {
            return $(this).find('td:first-child a').attr('href') === star_data.link;
        };

        for (var key in localStorage) {
            if (/^_starred_pr/.test(key)) {
                var star_data = JSON.parse(localStorage.getItem(key));
                tables.find('tbody tr').filter(find_starred_row).find('.star-trigger')
                    .addClass('star')
                    .find('img')
                    .attr('src', colour_star);
            }
        }
        
    }

    function createStarredMenuTab() {
        var div = $('div.pull-requests-content'),
            tab_menu = div.find('ul.tabs-menu');

        var new_menu_item = $('<li/>', {
            'class': "menu-item", 
            'data-module-key': "stash.pull-requests.list.nav.starred",
            'title': "Pull Requests that have been starred"
        });
        new_menu_item.appendTo(tab_menu);

        var new_menu_ahref = $('<a/>', {
            'id': "starred-pr-tab-navigate",
            'href': getCurrentPath() + "?state=starred",
        });
        new_menu_ahref.html('<strong>Starred</strong>');
        new_menu_ahref.appendTo(new_menu_item);

    }

     /**
      * END: STARTUP-ONLY FUNCTIONS
      */

    // @handles click : a#starred-pr-tab-navigate
    function navigateToStarredTab(event) {
        event.preventDefault();

        var trigger = $(this);

        // change the current URL by pushing a new state
        history.pushState({}, 'Starred Pull Requests', trigger.attr('href'));

        // select this tab
        var menu_item = trigger.parent();
        menu_item.prevAll().removeClass('active-tab');
        menu_item.addClass('active-tab');

        // clear the current tab content
        var div_content = menu_item.parents('div.pull-requests-content');
        div_content.find('table.pull-requests-table').remove();
        div_content.find('div.pull-request-table-message').remove();

        // build the new table
        var table = $('<table/>', {'class': "aui pull-requests-table"}),
            table_header = $('<thead/>'),
            table_body = $('<tbody/>');
        
        table_header.append('<tr><th class="id">ID</th><th id="title">Title</th></tr>');
 
        // TODO: add star trigger beside each item
        // TODO: allow  adding notes and saving to localStorage to each starred item
        var pattern = new RegExp('^_starred_pr_' + getCurrentPath());
        for (var key in localStorage) {
            if (pattern.test(key)) {
                var star_data = JSON.parse(localStorage.getItem(key));
                var row = $('<tr/>', {
                    'class': "pull-request-row",
                    'data-pullrequestid': star_data.id
                });
                var id_col = $('<td/>', {'class': "id"}),
                    id_href = $('<a/>', {
                    'href': star_data.link,
                    text: "#" + star_data.id
                });
                id_href.appendTo(id_col);
                id_col.appendTo(row);
                
                var title_col = $('<td/>', {'class': "title"}),
                    title_href = $('<a/>', {
                    'href': star_data.link,
                    text: star_data.title
                });
                title_href.appendTo(title_col);
                title_col.appendTo(row);

                row.appendTo(table_body);
            }
        }

        
        table.appendTo(div_content);  
        
        // show table header and body if there are existing items
        if (table_body.children().length > 0) {
            table_header.appendTo(table);
            table_body.appendTo(table);
        }
        else {
            var message_div = $('<div>', {'class': "pull-request-table-message"})
                .append($('<h3>', {'class': "no-results entity-empty", text: "There are no starred pull requests."}));
            message_div.appendTo(div_content);
        }

    }

    // @handles click : a.star-trigger
    function toggleStarredItems(event) {
        event.preventDefault();

        var trigger = $(this),
            trigger_image = trigger.find('img'),
            target = trigger.parent().find('a').first(),
            star_data = {
                id: target.closest('tr').data('pullrequestid'),
                link: target.attr('href'),
                title: target.attr('title')
            };
        trigger.toggleClass('star');

        if (trigger.hasClass('star')) {
            trigger_image.attr('src', colour_star);
            addStorageEntry(star_data);

        } else {
            trigger_image.attr('src', grey_star);
            removeStorageEntry(star_data);
        }
    }

    function addStorageEntry(obj) {
        localStorage.setItem('_starred_pr_' + obj.link, JSON.stringify(obj));
    }

    function removeStorageEntry(obj) {
        localStorage.removeItem('_starred_pr_' + obj.link);
    }

    function getCurrentPath() {
        return location.pathname;
    }

}
