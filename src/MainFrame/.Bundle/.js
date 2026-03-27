


App.Modules.MainFrame = class extends Colibri.Modules.Module {

    /** @constructor */
    constructor() {
        super('MainFrame');
        this._widgets = {};
    }

    InitializeModule() {
        super.InitializeModule();

        this._mainPage = null;
        this._store = App.Store.AddChild('app.mainframe', {}, this);


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

            if(App.Comet) {
                this.__eventReceived = (event, args) => this.__cometEventReceived(event, args);
                App.Comet.RemoveHandler('EventReceived', this.__eventReceived);
                App.Comet.AddHandler('EventReceived', this.__eventReceived);
            } 

            this.FrameSettings();
            this.Status();
                
        });
        
        this._store.AddHandler('StoreLoaderCrushed', (event, args) => {
            if(args.status === 403) {
                location.reload();
            }
        });
        this.AddHandler('CallError', (event, args) => {
            if(args.status === 403) {
                location.reload();
            }
        });

    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
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
        if(!this._mainPage) {
            return;
        }
        url = url.trimString('/').replaceAll('mainframe/', '');
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
App.Modules.MainFrame.Icons.MenuIcon = '<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 2H5V26H2V2Z" fill="black"/><path d="M26 12.7895V9.15789H6.63158V12.7895H26Z" fill="black"/><path d="M16.3158 6.73684V3.10526H6.63158V6.73684H16.3158Z" fill="black"/><path d="M22.3684 15.2105V18.8421H6.63158V15.2105H22.3684Z" fill="black"/><path d="M18.7368 24.8947V21.2632H6.63158V24.8947H18.7368Z" fill="black"/></svg>';
App.Modules.MainFrame.Icons.StructureIcon = '<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M2 12.75V4H26V12.75H2ZM2 24H9.57895V15.25H2V24ZM12.1053 24H26V15.25H12.1053V24Z" fill="black"/></svg>';
App.Modules.MainFrame.Icons.DevIcon = '<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.4 25H23.6C24.9236 25 26 23.9037 26 22.5556V5.44444C26 4.09633 24.9236 3 23.6 3H4.4C3.0764 3 2 4.09633 2 5.44444V22.5556C2 23.9037 3.0764 25 4.4 25ZM4.4 22.5556V7.88889H23.6L23.6012 22.5556H4.4Z" fill="black"/><path d="M14 17.6667H21.2V20.1111H14V17.6667ZM6.8 12.7778L9.5516 15.5803L6.8 18.3829L8.4968 20.1111L12.9452 15.5803L8.4968 11.0496L6.8 12.7778Z" fill="black"/></svg>';
App.Modules.MainFrame.Icons.MoreIcon = '<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M17.7043 14C17.7043 16.2091 15.9135 18 13.7043 18C11.4952 18 9.70435 16.2091 9.70435 14C9.70435 11.7909 11.4952 10 13.7043 10C15.9135 10 17.7043 11.7909 17.7043 14ZM15.7043 14C15.7043 15.1046 14.8089 16 13.7043 16C12.5998 16 11.7043 15.1046 11.7043 14C11.7043 12.8954 12.5998 12 13.7043 12C14.8089 12 15.7043 12.8954 15.7043 14Z" fill="black"/><path fill-rule="evenodd" clip-rule="evenodd" d="M2.16571 9.89156L4.41639 6.1085C4.70695 5.62012 5.30871 5.39397 5.86243 5.56507L8.13396 6.26691C8.43707 6.05061 8.75156 5.85219 9.07562 5.67213C9.38432 5.49986 9.70354 5.34327 10.032 5.20352L10.5414 2.94356C10.6656 2.39266 11.1684 2 11.7494 2H16.2508C16.832 2 17.3346 2.39266 17.4588 2.94356L17.9682 5.20352C18.3168 5.35182 18.6549 5.51905 18.9811 5.70388C19.2852 5.87545 19.5806 6.06325 19.866 6.26691L22.1376 5.56507C22.6913 5.39397 23.2931 5.62014 23.5836 6.1085L25.8343 9.89156C26.1248 10.3798 26.0258 10.9987 25.5962 11.3785L23.8341 12.9367C23.8746 13.2906 23.8945 13.6452 23.8942 13.9987C23.8946 14.353 23.8747 14.7085 23.8341 15.0634L25.5962 16.6215C26.0258 17.0013 26.1248 17.6202 25.8343 18.1086L23.5836 21.8916C23.293 22.3798 22.6913 22.606 22.1376 22.4349L19.866 21.7332C19.5771 21.9393 19.2779 22.1292 18.97 22.3024C18.6472 22.4847 18.3129 22.6498 17.9682 22.7965L17.4588 25.0564C17.3346 25.6074 16.832 26 16.2508 26H11.7494C11.1684 26 10.6656 25.6074 10.5414 25.0564L10.032 22.7965C9.70738 22.6584 9.39175 22.5038 9.0864 22.3339C8.75853 22.1522 8.44043 21.9518 8.13396 21.7332L5.86243 22.4349C5.30871 22.606 4.70694 22.3798 4.41638 21.8916L2.16571 18.1086C1.87516 17.6202 1.97422 17.0013 2.40376 16.6215L4.16587 15.0634C4.12536 14.709 4.10551 14.354 4.10586 14C4.10551 13.646 4.12536 13.291 4.16587 12.9367L2.40376 11.3785C1.97422 10.9987 1.87516 10.3798 2.16571 9.89156ZM15.2555 4.4L15.8214 6.91071L16.9753 7.40158C17.2362 7.51258 17.4894 7.63785 17.734 7.77644L17.738 7.77868C17.966 7.9073 18.1874 8.048 18.4009 8.20044L19.4159 8.9247L21.9395 8.14498L23.1948 10.255L21.2372 11.986L21.3761 13.2012C21.4064 13.4661 21.4212 13.7317 21.421 13.9968L21.4211 14.0012C21.4213 14.267 21.4065 14.5333 21.3761 14.7988L21.2372 16.014L23.1948 17.745L21.9395 19.855L19.4159 19.0753L18.4009 19.7996C18.1848 19.9539 17.9606 20.0961 17.7297 20.2261L17.7256 20.2282C17.4836 20.365 17.2332 20.4886 16.9753 20.5984L15.8214 21.0892L15.2555 23.6H12.7447L12.1788 21.0892L11.0249 20.5984C10.7819 20.495 10.5455 20.3792 10.3166 20.2519L10.3125 20.2496C10.0667 20.1134 9.82843 19.9633 9.59905 19.7996L8.58411 19.0753L6.06053 19.855L4.80516 17.745L6.76277 16.014L6.62392 14.7988C6.5936 14.5335 6.57872 14.2676 6.57898 14.0023L6.57897 13.9977C6.57872 13.7324 6.5936 13.4665 6.62392 13.2012L6.76277 11.986L4.80516 10.255L6.06053 8.14497L8.58409 8.9247L9.59905 8.20044C9.82596 8.03853 10.0615 7.88989 10.3045 7.75489L10.3086 7.75263C10.54 7.62348 10.7791 7.50619 11.0249 7.40158L12.1788 6.91071L12.7447 4.4H15.2555Z" fill="black"/></svg>';
App.Modules.MainFrame.Icons.ToolbarIcon = '<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M23.3333 2H4.66667C3.196 2 2 3.196 2 4.66667V23.3333C2 24.804 3.196 26 4.66667 26H23.3333C24.804 26 26 24.804 26 23.3333V4.66667C26 3.196 24.804 2 23.3333 2ZM4.66667 4.66667H12.6667V23.3333H4.66667V4.66667ZM15.3333 23.3333V4.66667H23.3333L23.336 23.3333H15.3333Z" fill="black"/><path d="M9 9H11V11H9V9Z" fill="black"/><path d="M9 16H11V18H9V16Z" fill="black"/><path d="M9 12.5H11V14.5H9V12.5Z" fill="black"/></svg>';
App.Modules.MainFrame.Icons.CometIcon = '<svg width="28" height="27" viewBox="0 0 28 27" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M21.5 11.775C21.5 8.2445 20.075 5.289 16.5 4.507V2H11.5V4.507C7.9125 5.289 6.5 8.233 6.5 11.775V18.1L4 19.25V21.55H24V19.25L21.5 18.1V11.775ZM14.5 24.954C14.3375 24.9885 14.175 25 14 25C12.6125 25 11.5 23.965 11.4875 22.7H16.4875C16.4875 23.022 16.425 23.321 16.3 23.597C15.975 24.287 15.3125 24.793 14.5 24.954Z" fill="black"/></svg>';

const MainFrame = new App.Modules.MainFrame();

