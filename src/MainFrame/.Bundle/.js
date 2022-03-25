


App.Modules.MainFrame = class extends Colibri.Modules.Module {

    /** @constructor */
    constructor() {
        super('MainFrame');
    }

    InitializeModule() {

        this._mainPage = null;

        console.log('Initializing module MainFrame');
        
        App.Store.AddPathHandler('app.authorization.user', (userData) => {
            if(userData && userData.id && userData.id > 0) {       
                // рисуем для монолита
                if(window.landing && !window.mainManu && document.querySelector('.app-menu-component-container')) {
                    window.mainManu = new App.Modules.MainFrame.Header('app-module-header', document.querySelector('.app-menu-component-container')); 
                    window.mainManu.shown = true;
                }
                this.FrameSettings();
            }
        });

        App.Comet.AddHandler('MessageReceived', (event, args) => {
            if(args.message.data.handle.indexOf('/personnel') !== -1) {
                const events = {
                    'Заявление на отпуск': 'F9C021CA-A651-4E47-8E26-521D59B1B1ED',
                    'Заявление на вычет': '5AFE8181-1247-4EFF-BC0A-4E393AE1A701',
                    'Запрос документов': '11CE355D-CBED-4042-BB81-812C79914042',
                    'Уведомление об отсутствии': '6A167674-A088-4B8A-A0DD-F52070ED6CA0',
                    'Изменение данных': '5CDEC211-ADF3-4BCF-B553-94727905D226',
                    'Произвольный запрос': 'CC027FBE-35F5-4DC7-B039-A207BC08D642'
                };
                if(events[args.message.data.message]) {
                    App.SendEventToCRM('kadr', events[args.message.data.message]);
                }
            }
        });

        App.AddHandler('ApplicationReady', (event, args) => {
            if(!window.landing) {                
                this.Render(document.body);                
            }
                
            App.Router.AddRoutePattern('/app', (url, options) => {
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

    Render(container) {
        if(this._mainPage) {
            return;
        }

        console.log('Rendering Module MainFrame');
        this._mainPage = new App.Modules.MainFrame.MainPage('mainpage', container);

        App.Store.AddPathHandler('app.authorization.user', (userData) => {
            if(userData && userData.id && userData.id > 0) {       
                this.ShowMainPage(userData);
            }     
            else {
                this._mainPage.Dispose();
            }            
        });        


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

