App.Modules.MainFrame.CometDropDown = class extends Colibri.UI.DropDown {

    constructor(name, container) {
        super(name, container);
        this.AddClass('app-cometdropdown-component');
        this.search = false;

        this._showAll = false;

        this._list.AddHandler('ItemClicked', (event, args) => {
            if(args.item.value.data == 'showall') {
                if(args.item.value.title == 'Показать все') {
                    this._showAll = true;
                }
                else {
                    this._showAll = false;
                }
                args.item.value = args.item.value;
                this.ReloadBinding();
            }
            else if(args.item.value.data && args.item.value.data.handle) {
                this.Hide();
                App.Router.Navigate(args.item.value.data.handle, {});
            }
            args.domEvent.stopPropagation();
            args.domEvent.preventDefault();
            return false;
        });

    }

    __renderItemContent(itemData, item) {

        if(itemData.title) {
            return itemData.title;
        }

        const flex = new Colibri.UI.FlexBox('flex', item);
        const icon = new Colibri.UI.Icon('icon', flex);
        const info = new Colibri.UI.Pane('info', flex);
        const date = new Colibri.UI.TextSpan('date', flex);
        const remove = new Colibri.UI.Icon('remove', flex);
        flex.shown = true;
        icon.shown = true;
        info.shown = true;
        date.shown = true;
        remove.shown = true;

        icon.iconSVG = itemData.data.icon;
        remove.value = Colibri.UI.CloseIcon;
        info.html = '<span>' + itemData.data.message + '</span><em>' + itemData.data.additional + '</em>';
        date.html = new Date(itemData.date).Age(true);

        remove.AddHandler('Clicked', (event, args) => {
            App.Comet.RemoveMessage(itemData);
            args.domEvent.preventDefault();
            args.domEvent.stopPropagation();
            return false;
        });

    }

    __renderBoundedValues(events) {
        this._list.Clear();

        if(!events || !events.messages) {
            return ;
        }

        const unread = document.querySelector('[data-object-name="comet"] .badge');
        if(unread) {
            if(events.unread > 0) {
                unread.classList.add('-shown');
            }
            else {
                unread.classList.remove('-shown');
            }
            const em = unread.querySelector('em');
            em.html(events.unread);

        }

        events.messages.sort((a, b) => {
            return new Date(a.date).getTime() < new Date(b.date).getTime() ? 1 : -1;
        });

        const isExists = events.messages.length > 0;
        const isMore = events.messages.length > 5;
        let messages = [].concat(events.messages);
        if(!this._showAll && isMore) {
            messages = messages.splice(0, 5);
        }

        let listData = [];
        if(!isExists) {
            listData.push({name: 'noevents', label: '', children: [{title: 'Нет уведомлений', data: 'noevents'}]});
            this._list.RemoveClass('-has-more');
            this._list.AddClass('-no-events');
        }
        else {
            this._list.RemoveClass('-no-events');
            listData.push({name: 'events', label: '', children: messages});
            if(isMore) {
                listData.push({name: 'showall', label: '', children: [{title: this._showAll ? 'Скрыть' : 'Показать все', data: 'showall'}]});
                this._list.AddClass('-has-more');
            }
            else {
                this._list.RemoveClass('-has-more');
            }
        }


        const renderer = new Colibri.UI.List.JsonRenderer(this._list, listData);
        renderer.Render();
    }

    set shown(value) {
        super.shown = value;
        if(value) {
            App.Comet.MarkAsRead();
        }

    }

}