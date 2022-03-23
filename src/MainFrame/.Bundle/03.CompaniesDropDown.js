App.Modules.MainFrame.CompaniesDropDown = class extends Colibri.UI.DropDown {

    constructor(name, container) {
        super(name, container);
        this.AddClass('app-companiesdropdown-component');
        
        this._search.AddHandler('KeyUp', (event, args) => {

            if(this._search.value === '') {
                Object.forEach(this._list.Find('orgs').Children(), (name, item) => { item.shown = true; });
            }
            else {
                Object.forEach(this._list.Find('orgs').Children(), (name, item) => { item.shown = item.tag.title.toLowerCase().indexOf(this._search.value.toLowerCase()) !== -1; });
            }


        });

        this._search.AddHandler('Cleared', (event, args) => {
            Object.forEach(this._list.Find('orgs').Children(), (name, item) => { item.shown = true; });
        });

    }

    __renderBoundedValues(values) {
        this._list.Clear();

        if(!values) {
            return ;
        }
        
        let orgs = Object.values(values);

        let data = [];
        data.push({name: 'orgs', label: '', children: orgs});
        data.push({name: 'addnew', label: '-', children: [{title: 'Добавить организацию', route: '/neworg/', isactive: '1'}]});
        
        const renderer = new App.Modules.MainFrame.CompaniesDropDown.JsonRenderer(this._list, data);
        renderer.Render();

        let selection = null;
        this._list.ForEach((name, group) => {
            group.ForEach((n, item) => {
                if(item.value.selected) {
                    selection = item;
                    return false;
                }
                return true;
            });
        });
        if(selection) {
            this._list.selected = selection;
        }

    }


}

App.Modules.MainFrame.CompaniesDropDown.JsonRenderer = class extends Colibri.UI.Renderer {

    Render() {

        this._data = Object.values(this._data);
        this._data.forEach((grp) => {

            const group = this._object.AddGroup(grp.name, grp.label);
            group.tag = group;
            grp.children && grp.children.forEach((itm) => {
                if(itm.isactive == '1') {
                    const item = group.AddItem(itm);
                    item.tag = itm;
                }
            });

        });

    }
}
