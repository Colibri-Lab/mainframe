App.Modules.MainFrame.MainMenuToolbar = class extends Colibri.UI.Toolbar {

    _renderLevel(list, parent) {

        list.forEach((item) => {

            if(item.children.length == 0) {

                const icon = new Colibri.UI.Icon(item.name + Date.Mc(), this);
                icon.value = eval(item.icon);
                icon.toolTip = item.title;
                icon.shown = true;
                icon.tag = item;

            }

            
            this._renderLevel(item.children);

        });

    }

    __renderBoundedValues(data) {

        if(!Array.isArray(data)) {
            return;
        }

        const icon = new Colibri.UI.Icon('lk', this);
        icon.icon = 'url(/res/img/mainframe-logo-colibri.svg)';
        icon.shown = true;
        icon.tag = null;
        icon.toolTip = 'Личный кабинет';

        this._renderLevel(data, this);

    }

}