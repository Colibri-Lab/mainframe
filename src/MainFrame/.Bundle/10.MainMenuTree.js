/**
 * Main menu tree component
 * @class
 * @extends Colibri.UI.Tree
 * @memberof App.Modules.MainFrame
 */
App.Modules.MainFrame.MainMenuTree = class extends Colibri.UI.Tree {

    /**
     * Constructor
     * @param {string} name component name
     * @param {Colibri.UI.Component} container component container
     * @constructor
     */
    constructor(name, container) {
        super(name, container);
        this.AddClass('app-mainframe-menu-tree');

        this.RegisterEvent('NodesLoaded', false, 'When nodes are loaded');
        this.AddHandler('NodeClicked', this.__nodeClicked);

    }

    /**
     * @ignore
     * @private
     * @param {Array} list list of nodes
     * @param {Colibri.UI.TreeNode} parent parent node
     */
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
     * @ignore
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
     * @ignore
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