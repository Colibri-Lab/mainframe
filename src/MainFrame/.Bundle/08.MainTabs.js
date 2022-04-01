App.Modules.MainFrame.MainTabs = class extends Colibri.UI.Tabs {
    constructor(name, container, element) {
        super(name, container, Colibri.UI.Templates['App.Modules.MainFrame.MainTabs']);
        this.AddClass('app-main-tabs-component');
        this.handleResize = true;

        this.Children('search-button').AddHandler('Clicked', (event, args) => this.Dispatch('SearchButtonClicked'));

        this.AddHandler('Resized', (event, args) => {
            this.header.css('width', (window.innerWidth - this.links.bounds().outerWidth) + 'px');
        });
        Colibri.Common.Wait(() => this.links.isConnected && this.links.bounds().outerWidth > 0, 15000, 200).then(() => this.Dispatch('Resized')); 

        this.header.addEventListener('mousewheel', (e) => {
            this.header.scrollLeft += e.deltaY;
            return false;
        });

    }

    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('SearchButtonClicked', false, 'Когда нажата кнопка поиска');
    }

    _createTabButton(name, title, color, closable, componentContainer, closeClicked = null) {
        const tabButton = new App.Modules.MainFrame.MainTabs.Button(name, this.header);
        tabButton.value = title;
        tabButton.closable = closable;
        tabButton.parent = this;
        tabButton.color = color;
        tabButton.contentContainer = componentContainer;
        componentContainer.tabButton = tabButton;
        tabButton.AddHandler('CloseClicked', (event, args) => {
            const currentIndex = tabButton.container.index();

            closeClicked && closeClicked();
            tabButton.Dispose();
            componentContainer.Dispose();

            this.selectedIndex = currentIndex - 1;

            args.domEvent.stopPropagation();
            args.domEvent.preventDefault();
            return false;
        });
        tabButton.AddHandler('Clicked', (event, args) => {
            return this.Dispatch('TabClicked', {domEvent: args.domEvent, tab: event.sender}); 
        });
        return tabButton;
    }
    
    AddTab(name, title, color, closable, componentContainer, closeClicked = null, index = null) {
        const tabButton = this._createTabButton(name, title, color, closable, componentContainer, closeClicked);
        this.Children(tabButton.name, tabButton, index, this.header);
        this.Children(componentContainer.name, componentContainer);
        this.header.scrollLeft = tabButton.container.bounds().left - this.links.bounds().outerWidth;
    }


}

App.Modules.MainFrame.MainTabs.Button = class extends Colibri.UI.Button {

    constructor(name, container) {
        super(name, container);
        this.AddClass('app-tab-button-component');

        this._colorObject = new Colibri.UI.TextSpan(this.name + '-color', this);
        this._textObject = new Colibri.UI.TextSpan(this.name + '-text', this);
        this._closeObject = new Colibri.UI.Icon(this.name + '-close', this);
        this._closeObject.value = Colibri.UI.CloseIcon;

        this._colorObject.shown = this._textObject.shown = this._closeObject.shown = true;

        this._color = null;

        this._closeObject.AddHandler('Clicked', (event, args) => this.Dispatch('CloseClicked', {domEvent: args.domEvent}));

    }

    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('CloseClicked', false, 'Когда нажали на кнопку закрытия');
    }

    get text() {
        return this._textObject;
    }

    get closable() {
        return this._closeObject.shown;
    }

    set closable(value) {
        this._closeObject.shown = value;
    }

    set color(value) {
        this._color = value;
        this._colorObject.AddClass(value);
    }

    get color() {
        return this._color;
    }

    get value() {
        return this._textObject.value;
    }

    set value(value) {
        this._textObject.value = value;
    }

}