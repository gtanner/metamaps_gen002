(function () {

    Metamaps.currentPage = "";

    var Router = Backbone.Router.extend({
        routes: {
            "": "home", // #home
            "explore/:section": "explore", // #explore/active
            "maps/:id": "maps" // #maps/7
        },
        home: function () {
            
            if (Metamaps.Active.Mapper) document.title = 'My Maps | Metamaps';
            else document.title = 'Home | Metamaps';

            Metamaps.currentSection = "";
            Metamaps.currentPage = "";
            $('.wrapper').removeClass('mapPage');

            var classes = Metamaps.Active.Mapper ? "homePage explorePage" : "homePage";
            $('.wrapper').addClass(classes);

            // all this only for the logged in home page
            if (Metamaps.Active.Mapper) {
                Metamaps.Famous.explore.set('mine');
                Metamaps.Famous.explore.show();

                $('.yield').fadeOut(300);
                $('.mapsWrapper').fadeIn(300);

                Metamaps.GlobalUI.Search.open();
                Metamaps.GlobalUI.Search.lock();

                Metamaps.Views.exploreMaps.setCollection( Metamaps.Maps.Mine );
                if (Metamaps.Maps.Mine.length === 0) {
                    Metamaps.Maps.Mine.getMaps(); // this will trigger an explore maps render
                }
                else {
                    Metamaps.Views.exploreMaps.render();
                }
            }
            // logged out home page
            else {
                Metamaps.Famous.explore.hide();

                Metamaps.GlobalUI.Search.unlock();
                Metamaps.GlobalUI.Search.close(0, true);

                $('.yield').fadeIn(300);
                $('.mapsWrapper').fadeOut(300);
            }

            Metamaps.Famous.viz.hide();
            Metamaps.Active.Map = null;

            setTimeout(function(){
                Metamaps.Router.navigate("");
            }, 500);
        },
        explore: function (section) {
            
            var capitalize = section.charAt(0).toUpperCase() + section.slice(1);
            
            document.title = 'Explore ' + capitalize + ' Maps | Metamaps';

            $('.wrapper').removeClass('homePage mapPage');
            $('.wrapper').addClass('explorePage');
            
            Metamaps.currentSection = "explore";
            Metamaps.currentPage = section;

            Metamaps.Views.exploreMaps.setCollection( Metamaps.Maps[capitalize] );
            if (Metamaps.Maps[capitalize].length === 0) {
                Metamaps.Maps[capitalize].getMaps(); // this will trigger an explore maps render
            }
            else {
                Metamaps.Views.exploreMaps.render();
            }

            Metamaps.GlobalUI.Search.open();
            Metamaps.GlobalUI.Search.lock();

            $('.yield').fadeOut(300);
            $('.mapsWrapper').fadeIn(300);

            Metamaps.Famous.explore.set(section);
            Metamaps.Famous.explore.show();

            Metamaps.Famous.viz.hide();
            Metamaps.Active.Map = null;

            setTimeout(function(){
                Metamaps.Router.navigate("/explore/" + section);
            }, 500);
        },
        maps: function (id) {
            
            document.title = 'Map ' + id + ' | Metamaps';
            
            Metamaps.currentSection = "map";
            Metamaps.currentPage = id;

            $('.wrapper').removeClass('homePage explorePage');
            $('.wrapper').addClass('mapPage');

            $('.yield').fadeOut(300);
            $('.mapsWrapper').fadeOut(300);

            Metamaps.Famous.explore.hide();

            // clear the visualization, if there was one, before showing its div again
            if (Metamaps.Visualize.mGraph) {
                Metamaps.Visualize.mGraph.graph.empty();
                Metamaps.Visualize.mGraph.plot();
                Metamaps.JIT.centerMap();
            }
            Metamaps.Famous.viz.show();

            Metamaps.GlobalUI.Search.unlock();
            Metamaps.GlobalUI.Search.close(0, true);

            Metamaps.Map.launch(id);
        }
    });
    
    Metamaps.Router = new Router();

    Metamaps.Router.init = function () {
        Backbone.history.start({
            silent: true,
            pushState: true,
            root: '/'
        });
        $(document).on("click", "a:not([data-bypass])", function (evt) {
            var segments;

            var href = {
                prop: $(this).prop("href"),
                attr: $(this).attr("href")
            };
            var root = location.protocol + "//" + location.host + Backbone.history.options.root;
            
            if (href.prop && href.prop === root) href.attr = ""
            
            if (href.prop && href.prop.slice(0, root.length) === root) {
                evt.preventDefault();

                segments = href.attr.split('/');
                segments.splice(0,1); // pop off the element created by the first /

                if (href.attr === "") Metamaps.Router.home();
                else {
                    Metamaps.Router[segments[0]](segments[1]);
                }
            }
        });
    }
})();