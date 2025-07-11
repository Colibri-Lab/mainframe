App.Modules.MainFrame.MainMenuTree = class extends Colibri.UI.Tree {
    constructor(name, container) {
        super(name, container);

        this.RegisterEvent('NodesLoaded', false, 'When nodes are loaded');
        this.AddHandler('NodeClicked', this.__nodeClicked);

    }

    _renderLevel(list, parent) {

        list.forEach((item) => {
            try {

                if(!Security.IsCommandAllowed('app.mainframe.' + (parent.tag && parent.tag?.name ? parent.tag.name + '.' : '') + item.name)) {
                    return;
                }

                let newNode = this.FindNode(parent.name + '_' + item.name);
                if(!newNode) {
                    newNode = parent.nodes.Add(parent.name + '_' + item.name);
                }
                newNode.text = item.title;
                newNode.isLeaf = item.children.length == 0;
                newNode.icon = eval(item.icon);
                // newNode.toolTip = item.description;
                newNode.tag = item;
                
                this._renderLevel(item.children, newNode);
            }
            catch(e) { }

        });

    }
 

    /**
     * Render bounded to component data
     * @protected
     * @param {*} data 
     * @param {String} path 
     */
    __renderBoundedValues(data, path) {

        if(!Array.isArray(data)) {
            return;
        }

        this._renderLevel(data, this);
        this.ExpandAll();

        this.Dispatch('NodesLoaded');

    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __nodeClicked(event, args) {

        const node = args.item;
        if(!node.isLeaf) {
            node.Expand();
            return false;
        }
        return true;

    }

}