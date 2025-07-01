App.Modules.MainFrame.CometIcon = class extends Colibri.UI.Icon {
    constructor(name, container) {
        super(name, container);
        this.AddClass('app-comet-button-component');

        this._iconContextMenu = [];
        this.AddHandler('Clicked', this.__iconClicked);

        this._list = new Colibri.UI.List(this.name + '_list', document.body);
        this._list.AddClass('app-commet-message-list-component');
        this._group = this._list.AddGroup('group', '');
        this._group.emptyMessage = '#{mainframe-comet-messages-empty}';
        this._list.__renderItemContent = (data, item) => {
            const messageContainer = new Colibri.UI.FlexBox('s', item);
            const messageIcon = new Colibri.UI.Icon('i', messageContainer);

            const messageTextContainer = new Colibri.UI.Pane('tc', messageContainer);
            const messageText = new Colibri.UI.TextSpan('s', messageTextContainer);
            const messageDateContainer = new Colibri.UI.FlexBox('dc', messageTextContainer);
            if (data.message.from) {
                const messageFrom = new Colibri.UI.TextSpan('f', messageDateContainer);
                messageFrom.shown = true;
                messageFrom.value = data.message.from;
            }

            const messageDate = new Colibri.UI.TextSpan('d', messageDateContainer);

            const messageRemove = new Colibri.UI.Icon('r', messageContainer);
            messageContainer.shown = messageText.shown = messageDate.shown = messageIcon.shown = messageRemove.shown = messageTextContainer.shown = messageDateContainer.shown = true;
            messageIcon.iconSVG = data.message.icon ?? 'Colibri.UI.MessageEnvelopeIcon';
            messageRemove.iconSVG = 'Colibri.UI.RemoveIcon';
            messageText.value = data.message.text;
            messageDate.value = data.date.toDate().Age();
            messageRemove.AddHandler('Clicked', this.__messageRemoveClicked, false, this);
            if (data.message.exec) {
                messageContainer.tag = data;
                messageContainer.AddHandler('Clicked', this.__messageContainerClicked, false, this);
            }
        };

        this._list.AddHandler('ShadowClicked', this._listShadowClicked, false, this);

        if (!!App.Comet) {
            this.shown = true;
        }

    }

    __messageContainerClicked(event, args) {
        let exec = event.sender.data.message.exec;
        try {
            exec = eval(exec);
        }
        catch (e) { }

        this._listShadowClicked(event, args);

        exec && exec(event.sender.data);

        args.domEvent.stopPropagation();
        args.domEvent.preventDefault();
        return false;

    }

    __messageRemoveClicked(event, args) {
        App.Comet && App.Comet.RemoveMessage(data);
        args.domEvent.stopPropagation();
        args.domEvent.preventDefault();
        return false;
    }



    /**
     * Render bounded to component data
     * @protected
     * @param {*} data 
     * @param {String} path 
     */
    __renderBoundedValues(data, path) {
        if (!data || !Object.isObject(data) || !Object.countKeys(data)) {
            return;
        }

        this._unreadCount = data.unread;
        this._messages = data.messages;
        this._renderList();

        if (this._unreadCount > 0) {
            if (!this._unreadCounter) {
                this._unreadCounter = new Colibri.UI.Counter(this.name + '_counter', this);
            }
            this._unreadCounter.value = this._unreadCount;
            this._unreadCounter.shown = true;
        }
        else if (this._unreadCounter) {
            this._unreadCounter.shown = false;
        }

    }

    _listShadowClicked(event, args) {
        this._list.hasShadow = false;
        this._list.Hide();
    }


    _setListPosition() {
        const point = this.container.bounds();
        this._list.styles = { left: point.left + 'px', top: (point.top + point.outerHeight) + 'px' };
    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */
    __iconClicked(event, args) {

        this._list.Show();
        this._list.BringToFront();
        this._list.hasShadow = true;
        this._setListPosition();
        App.Comet && App.Comet.MarkAsRead();

    }

    _renderList() {
        this._group.Clear();
        for (const message of this._messages) {
            this._group.AddItem(message);
        }
        if (this._list.shown) {
            this._list.BringToFront();
            this._list.hasShadow = true;
        }
    }

}