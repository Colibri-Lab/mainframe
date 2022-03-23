App.Modules.MainFrame.HelpWindow = class extends Colibri.UI.Window {

    constructor(name, container) {
        /* создаем компонент и передаем шаблон */
        super(name, container, Colibri.UI.Templates['App.Modules.MainFrame.HelpWindow'], 'Задать вопрос эксперту', 800);

        /* добавляем уникальный класс */
        this.AddClass('app-help-window-component');

        this.Children('buttons/tabs').AddHandler('Changed', (event, args) => {
            if(args.button) {
                if(args.button.name == 'online') {
                    this.Children('files-pane').shown = false;
                }
                else {
                    this.Children('files-pane').shown = true;
                }
            }
        });

        this.Children('split/message').AddHandler(['KeyUp', 'Cleared'], (event, args) => {
            this.Children('btn-send').enabled = event.sender.value.length > 0;
        });

        this.Children('btn-cancel').AddHandler('Clicked', (event, args) => {
            this.Hide();
        });

    }

    Show() {
        this.Children('split/message').value = '';
        this.Children('btn-send').enabled = false;
        this.Children('buttons/tabs').selectedIndex = 0;
        super.Show();
    }



}