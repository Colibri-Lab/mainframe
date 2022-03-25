App.Modules.MainFrame.Header = class extends Colibri.UI.FlexBox {

    constructor(name, container) {
        super(name, container, Colibri.UI.Templates['App.Modules.MainFrame.Header']);

        this.AddClass('app-main-page-header-component');

        this.Find('header-menu').AddHandler('DropDownMenuShown', (event, args) => {
            this.HideAll();
        });
        this.Find('header-menu').AddHandler('MenuItemClicked', (event, args) => {
            this.HideAll();
            if(args.item.route) {
                App.Router.Navigate(args.item.route, {});
            }
        });
        this.Find('header-links').AddHandler('MenuItemClicked', (event, args) => {
            if(args.item.route.indexOf('http') > -1) {
                window.open(args.item.route);
            }
            else {
                App.Router.Navigate(args.item.route, {});
            }
        });
        this.Find('profile-dropdown').AddHandler('ItemClicked', (event, args) => {
            if(args.item.tag.route.indexOf('http') > -1) {
                window.open(args.item.tag.route);
            }
            else {
                App.Router.Navigate(args.item.tag.route, {});
            }
            args.domEvent.stopPropagation();
            return false;
        });

        App.Router.AddRoutePattern('/comet/', (url, options) => {
            this.ShowCometDropDown();
            App.Router.Navigate('/', {});
        });

    }

    HideAll() {
        const dropdown = this.Find('profile-dropdown');
        const dropdown3 = this.Find('comet-dropdown');
        dropdown.Hide();
        dropdown3.Hide();
    }

    ShowProfilesDropDown() {

        if(!this.Find('header-links/profile')) {
            return;
        }

        this.Find('header-menu').ClosePopups();
        this.HideAll();

        const itembounds = this.Find('header-links/profile').container.bounds();
        const dropdown = this.Find('profile-dropdown');
        dropdown.Show();
        dropdown
            .container
            .css({left: (itembounds.left + itembounds.width - dropdown.width - 10) + 'px', top: itembounds.top + 35 + 'px'});
    }

    ShowHelpWindow() {
        
        this.Find('header-menu').ClosePopups();
        this.HideAll();

        if(!this._helpWindow) {
            this._helpWindow = new App.Modules.MainFrame.HelpWindow('help-window', this);
        }
        this._helpWindow.Show();
    }
    
    ShowCometDropDown() {
        
        if(!this.Find('header-links/comet')) {
            return;
        }
        
        this.Find('header-menu').ClosePopups();
        this.HideAll();

        const itembounds = this.Find('header-links/comet').container.bounds();
        const dropdown = this.Find('comet-dropdown');
        dropdown.Show();
        dropdown
            .container
            .css({left: (itembounds.left) + 'px', top: itembounds.top + 35 + 'px'});

    }

}