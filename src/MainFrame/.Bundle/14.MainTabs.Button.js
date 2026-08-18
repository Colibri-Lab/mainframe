/**
 * @class
 * @extends Colibri.UI.Button
 * @memberof App.Modules.MainFrame.MainTabs
 */
App.Modules.MainFrame.MainTabs.Button = class extends Colibri.UI.Button {

    /**
     * Constructor
     * @param {string} name component name
     * @param {Colibri.UI.Component} container component container
     * @constructor
     */
    constructor(name, container) {
        super(name, container);
        this.AddClass('app-tab-button-component');

        this._iconObject = new Colibri.UI.Icon(this.name + '-icon', this);
        this._textObject = new Colibri.UI.TextSpan(this.name + '-text', this);
        this._closeObject = new Colibri.UI.Icon(this.name + '-close', this);
        this._closeObject.value = Colibri.UI.CloseIcon;

        this._iconObject.shown = this._textObject.shown = this._closeObject.shown = true;

        this._color = null;

        this._closeObject.AddHandler('Clicked', (event, args) => this.Dispatch('CloseClicked', { domEvent: args.domEvent }));

    }

    /** 
     * @ignore
     * @protected
     */
    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('CloseClicked', false, 'When clicked on close button');
    }

    /**
     * Text object in button
     * @type {Colibri.UI.TextSpan}
     */
    get text() {
        return this._textObject;
    }

    /**
     * Is button closable
     * @type {boolean}
     */
    get closable() {
        return this._closeObject.shown;
    }

    /**
     * Is button closable
     * @type {boolean}
     */
    set closable(value) {
        this._closeObject.shown = value;
    }

    /**
     * Icon of button
     * @type {string}
     */
    set icon(value) {
        this._iconObject.value = value;
    }

    /**
     * Icon of button
     * @type {string}
     */
    get icon() {
        return this._iconObject.icon;
    }

    /**
     * Icon object name
     * @type {string}
     */
    get iconSVG() {
        return this._iconObject.iconSVG;
    }
    /**
     * Icon object name
     * @type {string}
     */
    set iconSVG(value) {
        this._iconObject.iconSVG = value;
    }

    /**
     * Button value
     * @type {string}
     */
    get value() {
        return this._textObject.value;
    }

    /**
     * Button value
     * @type {string}
     */
    set value(value) {
        this._textObject.value = value;
    }

}