


App.Modules.MainFrame = class extends Colibri.Modules.Module {

    /** @constructor */
    constructor() {
        super('MainFrame');
    }

    InitializeModule() {

        this._mainPage = null;

        console.log('Initializing module MainFrame');
        

        App.AddHandler('ApplicationReady', (event, args) => {

            App.Store.AddPathHandler('app.settings', (settings) => {

                const renderHandler = (userData) => (userData && userData.id && userData.id > 0) && this.Render(document.body, userData);
                const userStorePoint = settings.mainframe['user-store'];
                const userData = App.Store.Query(userStorePoint);
                if(userData && userData.id && userData.id > 0) {
                    renderHandler(userData);
                }
                else {
                    App.Store.AddPathHandler(userStorePoint, renderHandler);
                }
        
            });
            this.FrameSettings();
                
            App.Router.AddRoutePattern('/mainframe', (url, options) => {
                MainFrame.Execute(url, options);
                window.landing && App.Router.Navigate('/', {});
            });
            if(!window.landing) {
                App.Router.AddRoutePattern('/need-help/', (url, options) => {
                    this._mainPage && this._mainPage.ShowHelpWindow();
                    window.landing && App.Router.Navigate('/', {});
                });
            }
            App.Router.AddRoutePattern('/lk/', (url, options) => {
                if(window.landing) {
                    window.mainManu.ShowProfilesDropDown();
                    App.Router.Navigate('/', {});
                }
                else {
                    this._mainPage && this._mainPage.ShowProfilesDropDown();
                }
            });
            
        });

    }

    Render(container, userData) {
        if(this._mainPage) {
            return;
        }

        console.log('Rendering Module MainFrame');
        
        this._mainPage = new App.Modules.MainFrame.MainPage('mainpage', container);
        this.ShowMainPage(userData);

    }

    ShowMainPage(userData) {
        this._mainPage.user = userData;
        this._mainPage.Show();
    }

    RegisterEvents() {
        console.log('Registering module events for MainFrame');
    }

    RegisterEventHandlers() {
        console.log('Registering event handlers for MainFrame');
    }

    FrameSettings() {
        this.Call('Frame', 'Settings').then((response) => {

            if(response.status == 200) {
                App.Store.Set('app.settings', response.result);
            }
            else {
                App.Notices.Add({
                    severity: 'error',
                    title: response.result,
                    timeout: 5000
                });
            }

        });
    }

    AddTab(name, title, color, closable, container, closeClicked, hash, index) {
        if(!this._mainPage) {
            this.Render(document.body);
        }
        return this._mainPage.AddTab(name, title, color, closable, container, closeClicked, hash, index);
    }

    SelectTab(container) {
        if(!this._mainPage) {
            this.Render(document.body);
        }
        return this._mainPage.SelectTab(container);
    }

    MenuItem(path) {
        let notFound = false;
        let menu = {children: App.Store.Query('app.settings.mainframe.menu')};
        path = path.split('/');
        path.splice(0, 1);
        path.forEach((v) => {
            const found = Object.values(menu.children).filter((m) => m.name == v);
            if(found.length > 0) {
                menu = found[0];
            }
            else {
                notFound = true;
                return false;
            }
            return true;
        });
        if(notFound) {
            return null;
        }
        return menu;
    }

    Execute(url, options) {
        this.Call('Frame', 'Execute', {route: url, options: options}).then((response) => {
            if(response.status == 200) {
                try {
                    eval(response.result.execute);
                    // ! временно иначе глючит в основном бухсофт
                    // ! App.Router.Navigate('/', {});
                }
                catch(e) {
                    App.Notices.Add({
                        severity: 'error',
                        title: e,
                        timeout: 5000
                    });
                }
            }
            
        }).catch((response) => {
            App.Notices.Add({
                severity: 'error',
                title: response.result,
                timeout: 5000
            });
        });
    }
    

}

const MainFrame = new App.Modules.MainFrame();

