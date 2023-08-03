


App.Modules.MainFrame = class extends Colibri.Modules.Module {

    /** @constructor */
    constructor() {
        super('MainFrame');
        this._widgets = {};
    }

    InitializeModule() {
        super.InitializeModule();

        this._mainPage = null;
        this._store = App.Store.AddChild('app.mainframe');


        console.log('Initializing module MainFrame');

        this.RegisterEvent('RouteHandled', false, 'Когда произошел переход');
        
        App.Router.AddRoutePattern('/mainframe/', (url, options) => this.__routeHandled(url, options));

        App.AddHandler('ApplicationReady', (event, args) => {

            App.Store.AddPathHandler('app.settings.mainframe', (settings) => {
                if(!settings || Object.countKeys(settings) == 0) {
                    return;
                }

                const renderHandler = (userData) => (userData && userData.id && userData.id > 0) && this.Render(document.body, settings['user-store']);
                const userStorePoint = settings['user-store'];
                const userData = App.Store.Query(userStorePoint);
                if(userData && userData.id && userData.id > 0) {
                    renderHandler(userData);
                }
                else {
                    App.Store.AddPathHandler(userStorePoint, renderHandler);
                }
        
            });

            App.Comet && App.Comet.AddHandler('EventReceived', (event, args) => this.__cometEventReceived(event, args));

            this.FrameSettings();
            this.Status();
                
        });
        
        this.AddHandler('CallError', (event, args) => {
            if(args.status === 403) {
                location.reload();
            }
        });

    }

    __cometEventReceived(event, args) {
        if(args.event.action == 'status') {
            
            if(args.event.message.error) {
                App.Notices.Add({
                    severity: Colibri.UI.Notice.Error,
                    title: args.event.message.error,
                    timeout: 5000
                });
            }
            
            const fpmResult = args.event.message;
            this._store.Set('mainframe.status', fpmResult);


        }
    }

    __routeHandled(url, options) {
        url = url.trim('/').replaceAll('mainframe/', '');
        const node = this._mainPage.Menu.FindNode('menu_' + url.replaceAll('/', '_'));
        this._mainPage.Menu.Select(node);
        App.Router.Navigate('/', {}, true, true);
    }

    Render(container, userData) {
        if(this._mainPage) {
            return;
        }

        console.log('Rendering Module MainFrame');
        
        this._mainPage = new App.Modules.MainFrame.MainPage('mainpage', container);
        this._mainPage.user = userData;
        this.ShowMainPage();


    }

    ShowMainPage(userData) {
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
                App.Store.Set('app.settings.mainframe', response.result);
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

    OpenTab(title, route, icon, containerComponent) {
        this._mainPage.Tabs.AddTab(title, route, icon, containerComponent);
    }

    get MainPage() {
        return this._mainPage;
    }

    get Store() {
        return this._store;
    }

    Status() {
        return new Promise((resolve, reject) => {
            this.Call('Dashboard', 'Status', {}).then((response) => {
                this._store.Set('mainframe.graph', response.result.graph);
                this._store.Set('mainframe.status', {fpm: response.result.fpm, server: response.result.server, databases: response.result.databases});
                resolve();
            }).catch(error => {
                App.Notices.Add(new Colibri.UI.Notice(error.result));
                reject(error);
            });
        });
    }

    get registeredWidgets() {
        return this._widgets;
    }

    RegisterWidget(name, component) {
        this._widgets[name] = component;
    }
    UnregisterWidget(name) {
        delete this._widgets[name];
    }

}

App.Modules.MainFrame.Icons = {};
App.Modules.MainFrame.Icons.MenuIcon =                  '<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 4H7V24H5V4Z" fill="#2E3A59"/><path d="M24 13V10L8 10L8 13L24 13Z" fill="#2E3A59"/><path d="M16 8V5L8 5L8 8L16 8Z" fill="#2E3A59"/><path d="M21 15V18L8 18L8 15L21 15Z" fill="#2E3A59"/><path d="M18 23L18 20L8 20V23H18Z" fill="#2E3A59"/></svg>';
App.Modules.MainFrame.Icons.StructureIcon =             '<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M5 13V6H24V13H5ZM5 22H11V15H5V22ZM13 22H24V15H13V22Z" fill="#2E3A59"/></svg>';
App.Modules.MainFrame.Icons.DevIcon =                   '<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 23H22C23.103 23 24 22.103 24 21V7C24 5.897 23.103 5 22 5H6C4.897 5 4 5.897 4 7V21C4 22.103 4.897 23 6 23ZM6 21V9H22L22.001 21H6Z" fill="#2E3A59"/><path d="M14 17H20V19H14V17ZM8 13L10.293 15.293L8 17.586L9.414 19L13.121 15.293L9.414 11.586L8 13Z" fill="#2E3A59"/></svg>';
App.Modules.MainFrame.Icons.MoreIcon =                  '<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M17.7043 14C17.7043 16.2091 15.9135 18 13.7043 18C11.4952 18 9.70435 16.2091 9.70435 14C9.70435 11.7909 11.4952 10 13.7043 10C15.9135 10 17.7043 11.7909 17.7043 14ZM15.7043 14C15.7043 15.1046 14.8089 16 13.7043 16C12.5998 16 11.7043 15.1046 11.7043 14C11.7043 12.8954 12.5998 12 13.7043 12C14.8089 12 15.7043 12.8954 15.7043 14Z" fill="#2E3A59"/><path fill-rule="evenodd" clip-rule="evenodd" d="M4.13401 10.5763L5.95412 7.42375C6.18909 7.01677 6.67573 6.82831 7.12352 6.97089L8.96049 7.55576C9.20561 7.37551 9.45994 7.21016 9.722 7.06011C9.97165 6.91655 10.2298 6.78606 10.4954 6.6696L10.9074 4.7863C11.0078 4.32722 11.4144 4 11.8843 4H15.5245C15.9945 4 16.401 4.32722 16.5014 4.7863L16.9134 6.6696C17.1953 6.79318 17.4687 6.93254 17.7325 7.08657C17.9784 7.22954 18.2173 7.38604 18.4481 7.55576L20.2851 6.97089C20.7329 6.82831 21.2196 7.01678 21.4545 7.42375L23.2746 10.5763C23.5096 10.9832 23.4295 11.4989 23.0821 11.8154L21.6571 13.1139C21.6898 13.4088 21.7059 13.7043 21.7057 13.9989C21.706 14.2942 21.6899 14.5904 21.6571 14.8862L23.0821 16.1846C23.4295 16.5011 23.5096 17.0168 23.2746 17.4238L21.4545 20.5763C21.2195 20.9832 20.7329 21.1717 20.2851 21.0291L18.4481 20.4443C18.2145 20.6161 17.9725 20.7743 17.7235 20.9187C17.4625 21.0706 17.1921 21.2082 16.9134 21.3304L16.5014 23.2137C16.401 23.6728 15.9945 24 15.5245 24H11.8843C11.4144 24 11.0078 23.6728 10.9074 23.2137L10.4954 21.3304C10.2329 21.2153 9.97766 21.0865 9.73072 20.9449C9.46558 20.7935 9.20833 20.6265 8.96049 20.4443L7.12352 21.0291C6.67573 21.1717 6.18908 20.9832 5.95411 20.5763L4.13401 17.4238C3.89904 17.0168 3.97915 16.5011 4.32652 16.1846L5.75152 14.8862C5.71876 14.5908 5.70271 14.295 5.70299 14C5.70271 13.705 5.71876 13.4092 5.75152 13.1139L4.32652 11.8154C3.97915 11.4989 3.89904 10.9832 4.13401 10.5763ZM14.7196 6L15.1773 8.09226L16.1104 8.50132C16.3214 8.59382 16.5262 8.69821 16.724 8.8137L16.7272 8.81557C16.9116 8.92275 17.0906 9.04 17.2633 9.16703L18.0841 9.77058L20.1249 9.12082L21.1401 10.8792L19.557 12.3217L19.6693 13.3343C19.6938 13.5551 19.7058 13.7764 19.7056 13.9973L19.7057 14.001C19.7059 14.2225 19.6939 14.4444 19.6693 14.6657L19.557 15.6783L21.1401 17.1208L20.1249 18.8792L18.0841 18.2294L17.2633 18.833C17.0885 18.9616 16.9072 19.0801 16.7205 19.1884L16.7172 19.1902C16.5215 19.3042 16.319 19.4072 16.1104 19.4987L15.1773 19.9077L14.7196 22H12.6892L12.2315 19.9077L11.2984 19.4987C11.1019 19.4125 10.9107 19.316 10.7256 19.2099L10.7223 19.208C10.5235 19.0945 10.3308 18.9694 10.1453 18.833L9.32452 18.2294L7.28372 18.8792L6.26851 17.1208L7.85162 15.6783L7.73933 14.6657C7.71481 14.4446 7.70278 14.223 7.70299 14.0019L7.70298 13.9981C7.70278 13.777 7.71481 13.5554 7.73933 13.3343L7.85162 12.3217L6.26851 10.8792L7.28372 9.12081L9.32451 9.77058L10.1453 9.16703C10.3288 9.03211 10.5193 8.90824 10.7158 8.79574L10.7191 8.79386C10.9062 8.68623 11.0996 8.58849 11.2984 8.50132L12.2315 8.09226L12.6892 6H14.7196Z" fill="#2E3A59"/></svg>';
App.Modules.MainFrame.Icons.ToolbarIcon =               '<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 5H7C5.897 5 5 5.897 5 7V21C5 22.103 5.897 23 7 23H21C22.103 23 23 22.103 23 21V7C23 5.897 22.103 5 21 5ZM7 7H13V21H7V7ZM15 21V7H21L21.002 21H15Z" fill="#2E3A59"/><path d="M9 9H11V11H9V9Z" fill="#2E3A59"/><path d="M9 16H11V18H9V16Z" fill="#2E3A59"/><path d="M9 12.5H11V14.5H9V12.5Z" fill="#2E3A59"/></svg>';

App.Modules.MainFrame.Icons.CometIcon =                 '<svg width="28" height="27" viewBox="0 0 28 27" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M20 12.5C20 9.43 18.86 6.86 16 6.18V4H12V6.18C9.13 6.86 8 9.42 8 12.5L8 18L6 19V21H22V19L20 18L20 12.5ZM14.4 23.96C14.27 23.99 14.14 24 14 24C12.89 24 12 23.1 11.99 22H15.99C15.99 22.28 15.94 22.54 15.84 22.78C15.58 23.38 15.05 23.82 14.4 23.96Z" fill="#2E3A59"/></svg>';

const MainFrame = new App.Modules.MainFrame();

