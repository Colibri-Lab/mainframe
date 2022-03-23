App.Modules.MainFrame.MainMenu = class extends Colibri.UI.Component {

    constructor(name, container) {
        super(name, container, '<nav />');
        this.AddClass('app-mainmenu-component');

        this._selectedItem = null;

    }

    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('DropDownMenuShown', false, 'Открылась выпадашка');
        this.RegisterEvent('MenuItemClicked', false, 'Выбран пункт меню');
    }
     
    
    AddItem(name) {
        const menuitem = new App.Modules.MainFrame.MainMenu.Item(name, this);
        menuitem.AddHandler('TitleClicked', (event, args) => {
            if(this._selectedItem) {
                this._selectedItem.Close();
            }

            this._selectedItem = event.sender;

            if(!this._selectedItem.enabled && !this._selectedItem.hasmenu) {
                return false;
            }
            
            if(this._selectedItem.hasmenu) {
                this._selectedItem.Open();
            }
            else {
                this.Dispatch('MenuItemClicked', {domEvent: args.domEvent, item: this._selectedItem});
            }
            args.domEvent.stopPropagation();
            return false;
        });
        menuitem.AddHandler('MenuItemClicked', (event, args) => {
            event.sender.Close();
            this.Dispatch('MenuItemClicked', {domEvent: args.domEvent, item: args.item});
            args.domEvent.stopPropagation();
            return false;
        });
        menuitem.AddHandler('MenuHelpClicked', (event, args) => {
            
            let helpDomain = null;
            const hosts = App.Store.Query('app.settings.hosts');
            if(hosts && document.domain == hosts.bo) {
                helpDomain = hosts.help.bo;
            }
            else {
                helpDomain = hosts.help.gbs;
            }

            window.open(helpDomain + args.help);
            
            args.domEvent.stopPropagation();
            args.domEvent.preventDefault();
            return false;
        });
        menuitem.AddHandler('MenuMessageClicked', (event, args) => {
            if(args.dropdown.parent.tag.dropdown.link) {
                window.open(args.dropdown.parent.tag.dropdown.link);
            }
            args.domEvent.stopPropagation();
            return false;
        });
        return menuitem;
    }

    __renderBoundedValues(values) {
        this.Clear();

        if(!values) {
            return ;
        }

        if(!Array.isArray(values) && values instanceof Object) {
            values = Object.values(values);
        } 

        // проверяем что это массив в виде обьекта
        if(Object.keys(values)[0] !== '0') {
            return ;
        }

        const renderer = new App.Modules.MainFrame.MainMenu.JsonRenderer(this, values);
        renderer.Render();
    }

    ClosePopups() {
        if(this._selectedItem) {
            this._selectedItem.Close();
        }
    }

}

App.Modules.MainFrame.MainMenu.Item = class extends Colibri.UI.Component {

    constructor(name, container) {
        super(name, container);

        this.AddClass('app-mainmenu-item-component');
        this.shown = true;

        this._title = new Colibri.UI.TextSpan('title', this);
        this._title.shown = true;
        this._dropdown = new App.Modules.MainFrame.Dropdown('dropdown', this);

        this._title.AddHandler('Clicked', (event, args) => this.Dispatch('TitleClicked', args));
        this._dropdown.AddHandler('CloseButtonClicked', (event, args) => { this.Close(); });
        this._dropdown.AddHandler('MenuItemClicked', (event, args) => this.Dispatch('MenuItemClicked', args));
        this._dropdown.AddHandler('MenuHelpClicked', (event, args) => this.Dispatch('MenuHelpClicked', args));
        this._dropdown.AddHandler('MessageButtonClicked', (event, args) => this.Dispatch('MenuMessageClicked', args));

    }

    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('TitleClicked', false, 'Кликнули на заголовок меню');
        this.RegisterEvent('MenuItemClicked', false, 'Кликнули на пункте меню');
        this.RegisterEvent('MenuHelpClicked', false, 'Кликнули на помощи пункта меню');
        this.RegisterEvent('MenuMessageClicked', false, 'Кликнули на кнопку покупки в выпадашке');
    }

    get title() {
        return this._title.html;
    }
    set title(value) {
        this._title.html = value;
    }
    
    get route() {
        return this._title.href;
    }
    set route(value) {
        this._title.href = value;
    }

    get item() {
        return this._title;
    }

    get dropdown() {
        return this._dropdown;
    }

    get hasmenu() {
        return this._dropdown.children > 2;
    }

    Open() {
        if(this.hasmenu) {
            this.AddClass('-opened');
            this._dropdown.Show();
            this.parent.Dispatch('DropDownMenuShown', {item: this, dropdown: this._dropdown});
        }
    }

    Close() {
        this.RemoveClass('-opened');
        this._dropdown.Hide();
    }

    get toolTip() {
        return this._title.toolTip;
    }

    set toolTip(value) {
        this._title.toolTip = value;
    }

}

App.Modules.MainFrame.Dropdown = class extends Colibri.UI.Component {

    constructor(name, container) {
        super(name, container, '<div></div>');
        this.AddClass('app-dropdown-item-component');

        this._closeButton = new Colibri.UI.Icon('close-button', this);
        this._closeButton.value = Colibri.UI.CloseIcon;        
        this._closeButton.shown = true;

        this._message = null;
        this._messageText = null;
        this._messageButton = null;

        this._closeButton.AddHandler('Clicked', (event, args) => this.Dispatch('CloseButtonClicked', args));
        this.AddHandler('ClickedOut', (event, args) => {
            this.Dispatch('CloseButtonClicked', args)
        });

    }

    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('MessageButtonClicked', false, 'Кликнули на кнопке в сообщении');
        this.RegisterEvent('CloseButtonClicked', false, 'Кликнули на кнопке закрытия меню');
        this.RegisterEvent('MenuItemClicked', false, 'Кликнули на пункте меню');
        this.RegisterEvent('MenuHelpClicked', false, 'Кликнули на помощи пункта меню');
    }

    _createMessageElement() {
        if(this._message) {
            return;
        }

        this._message = new Colibri.UI.Pane('message', this);
        this._message.AddClass('app-menu-message-component');
        this._messageText = new Colibri.UI.TextSpan('message-test', this._message);
        this._messageButton = new Colibri.UI.Button('message-button', this._message);
        this._messageButton.html = 'Оплатить';
        this._messageButton.AddHandler('Clicked', (event, args) => this.Dispatch('MessageButtonClicked', {domEvent: args.domEvent, dropdown: this}));
        this._message.shown = true;
        this._messageButton.shown = true;
        this._messageText.shown = true;

        this.AddClass('app-component-hasmessage');

    }

    AddMenu(name) {
        const m = new App.Modules.MainFrame.Menu(name, this);
        m.AddHandler('ItemClicked', (event, args) => this.Dispatch('MenuItemClicked', {domEvent: args.domEvent, item: args.item, menu: this}));
        m.AddHandler('HelpClicked', (event, args) => this.Dispatch('MenuHelpClicked', {domEvent: args.domEvent, help: args.help, item: args.item, menu: this}));
        return m;
    }


    get message() {
        if(!this._message) {
            return '';
        }
        return this._messageText.html;
    }
    set message(value) {
        // создаем элемент с сообщением
        this._createMessageElement()
        // записываем сообщение в текст
        this._messageText.html = value;        
    }

    set shown(value) {
        super.shown = value;
        if(super.shown) {
            this.BringToFront();
        }
        else {
            this.SendToBack();
        }
    }

}


App.Modules.MainFrame.Menu = class extends Colibri.UI.Component {

    constructor(name, container) {
        super(name, container);
        this.AddClass('app-menu-component');

        this._title = new Colibri.UI.TextSpan('menu-title', this);
        this._title.shown = true;

        this._items = new Colibri.UI.Component('menu-items-list', this, '<ul />');
        this._items.shown = true;

        this.shown = true;

    }
    
    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('ItemClicked', false, 'Кликнули на пункт меню');
        this.RegisterEvent('HelpClicked', false, 'Кликнули на помощь в пункте меню');
    }

    get title() {
        return this._title.html;
    }
    set title(value) {
        this._title.html = value;
    }

    AddItem(name) {
        const i = new App.Modules.MainFrame.Menu.Item(name, this._items);
        i.AddHandler('Clicked', (event, args) => this.Dispatch('ItemClicked', {item: event.sender, domEvent: args.domEvent}));
        i.AddHandler('HelpClicked', (event, args) => this.Dispatch('HelpClicked', {item: event.sender, help: args.help, domEvent: args.domEvent}));
        return i;
    }

}

App.Modules.MainFrame.Menu.Item = class extends Colibri.UI.Component {

    constructor(name, container) {
        super(name, container, '<li />');
        this.AddClass('app-menu-item-component');

        this._important = new Colibri.UI.Icon('important', this);
        this._important.value = Colibri.UI.ImportatntIcon;
        this._href = new Colibri.UI.TextSpan('title', this);
        this._href.shown = true;
        
        this._help = new Colibri.UI.Link('help', this);
        this._help.shown = true;
        this._help.toolTip = 'Помощь';
        this._help.target = '_blank';
        this._help.AddHandler('Clicked', (event, args) => this.Dispatch('HelpClicked', {help: this._help.href, domEvent: args.domEvent}));

        const icon = new Colibri.UI.Icon('help-icon', this._help);
        icon.shown = true;
        icon.value = Colibri.UI.HelpIcon;
        const iconhover = new Colibri.UI.Icon('help-icon-hover', this._help);
        iconhover.value = Colibri.UI.HelpIconHover;

        this.shown = true;

    }

    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('HelpClicked', false, 'Кликнули на иконку помощи');
    }

    set important(value) {
        this._important.shown = value;
    }

    get important() {
        return this._important.shown;
    }

    set title(value) {
        this._href.html = value;
    }
    get title() {
        return this._href.html;
    }

    set help(value) {
        this._help.href = value;
        this._help.shown = !!value;
    }
    get help() {
        return this._help.href;
    }
    
    get route() {
        return this._href.href;
    }
    set route(value) {
        this._href.href = value;
    }

    
    get toolTip() {
        return this._href.toolTip;
    }

    set toolTip(value) {
        this._href.toolTip = value;
    }


}

App.Modules.MainFrame.MainMenu.JsonRenderer = class extends Colibri.UI.Renderer {

    Render() {

        const sort = (a, b) => {
            if(parseInt(a.position) == parseInt(b.position)) {
                return 0;
            }
            return parseInt(a.position) < parseInt(b.position) ? -1 : 1;
        };

        this._data = Object.values(this._data);
        this._data.forEach((dropdown) => {

            let popup = this._object.AddItem(dropdown.name);
            dropdown.class && popup.AddClass(dropdown.class);
            popup.route = dropdown.index;
            popup.title = dropdown.description;
            popup.elementID = dropdown.ident;
            popup.enabled = dropdown.enabled || (dropdown.children && Object.countKeys(dropdown.children) > 0);
            if(dropdown.message) {
                popup.dropdown.message = dropdown.message;
            }
            if(!popup.enabled) {
                popup.toolTip = 'Раздел вам недоступен';
            }
            popup.tag.dropdown = dropdown;

            const children = dropdown.children && Object.values(dropdown.children);
            children && children.sort(sort);

            children && children.forEach((menu) => {

                let subMenu = popup.dropdown.AddMenu(menu.name);
                subMenu.title = menu.description;
                menu.class && subMenu.AddClass(menu.class);
                subMenu.enabled = menu.enabled|| (menu.children && Object.countKeys(menu.children) > 0);
                subMenu.elementID = dropdown.ident;
                if(!subMenu.enabled) {
                    subMenu.toolTip = 'Раздел вам недоступен';
                }
    
                const children = menu.children && Object.values(menu.children);
                children && children.sort(sort);

                children && children.forEach((jitem) => {

                    let item = subMenu.AddItem(jitem.name);
                    item.title = jitem.description;                    
                    item.enabled = jitem.enabled;
                    item.elementID = jitem.ident;
                    if(!jitem.enabled) {
                        item.toolTip = 'Раздел вам недоступен';
                        item.help = null;
                    }
                    else {
                        item.important = jitem.important;
                        item.help = jitem.help;
                        item.route = jitem.index;
                    }
                    jitem.class && item.AddClass(jitem.class);

                });

            });


        });

    }
}
