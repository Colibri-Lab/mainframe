App.Modules.MainFrame.ProfileDropDown = class extends Colibri.UI.DropDown {

    constructor(name, container) {
        super(name, container);
        this.AddClass('app-profiledropdown-component');
        this.search = false;
    }

    __renderItemContent(itemData) {
        return itemData.icon ? itemData.icon + '<span>' + itemData.title + '</span>' : itemData.title;
    }

    __renderBoundedValues(values) {
        this._list.Clear();

        if(!values) {
            return ;
        }
        
        let menuData = values;
        let data = [];
        if(menuData.profile !== undefined) {
            data.push({name: 'profile', label: '', children: menuData.profile || []});
        }
        if(menuData.ads !== undefined) {
            data.push({name: 'ads', label: '-', children: menuData.ads || []});
        }
        data.push({name: 'logout', label: '-', children: [{title: 'Выйти из сервисов Актиона', route: '/logout/'}]});

        const renderer = new Colibri.UI.List.JsonRenderer(this._list, data);
        renderer.Render();
    }

}