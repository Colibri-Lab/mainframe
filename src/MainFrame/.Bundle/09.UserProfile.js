App.Modules.MainFrame.UserProfile = class extends Colibri.UI.Component {
    constructor(name, container) {
        super(name, container, Colibri.UI.Templates['App.Modules.MainFrame.UserProfile']);
        
        this.AddClass('app-user-profile-component');

        this._userName = this.Children('user-flex/info/name');
        this._userRole = this.Children('user-flex/info/role');
        this._logout = this.Children('user-flex/logout');

        this._logout.AddHandler('Clicked', (event, args) => this.Dispatch('LogoutClicked'));

    }

    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('LogoutClicked', false, 'Когда кликнули на выход');
    }

    __renderBoundedValues(data) {
        if(!data || !data?.id) {
            return;
        }

        this._userName.value = data.fio.lastName + ' ' + data.fio.firstName;
        this._userRole.value = data.role.name;

    }

}
