<?php



/**
 * Backend mainframe module package
 *
 * @author Author Name <author.name@action-media.ru>
 * @copyright 2019 Colibri
 * @package App\Modules\MainFrame
 */
namespace App\Modules\MainFrame;

use Colibri\App;
use Colibri\Modules\Module as BaseModule;
use Colibri\Utils\Config\Config;
use Colibri\Utils\Config\ConfigException;
use Colibri\Utils\Logs\Logger;
use Colibri\Utils\Menu\Item;


/**
 * Backend mainframe module
 * @package App\Modules\MainFrame
 */
class Module extends BaseModule
{

    /**
     * Синглтон
     *
     * @var Module
     */
    public static ? Module $instance = null;

    private mixed $_userModule = null;

    /**
     * Initializes the module
     * @return void
     */
    public function InitializeModule(): void
    {
        self::$instance = $this;

    }

    /**
     * Returns the User provider module
     * @return mixed
     */
    public function UserModule(): mixed
    {
        if ($this->_userModule) {
            return $this->_userModule;
        }

        $className = $this->Config()->Query('config.user-module')->GetValue();
        if (App::$moduleManager->$className) {
            $this->_userModule = App::$moduleManager->$className;
        }

        return $this->_userModule;

    }

    /**
     * Returns a topmost menu for backend
     */
    public function GetTopmostMenu(bool $hideExecuteCommand = true): Item|array
    {

        try {
            $menu = Module::$instance->Config()->Query('config.menu')->AsArray();
        } catch (ConfigException $e) {
            $menu = null;
        }

        if (!$menu) {
            $menu = Item::Create('mainframe', 'Приложение', 'Функции приложения', '', '');
        } else {
            $menu = Item::FromArray($menu);
        }

        $menu->Add([
            Item::Create('struct', '#{mainframe-menu-struct}', '', 'App.Modules.MainFrame.Icons.StructureIcon', ''),
            Item::Create('dev', '#{mainframe-menu-dev}', '', 'App.Modules.MainFrame.Icons.DevIcon', ''),
            Item::Create('more', '#{mainframe-menu-more}', '', 'App.Modules.MainFrame.Icons.MoreIcon', '')
        ]);
        // ->Add(
        //     Item::Create('menu', '#{mainframe-menu-more-menu}', '#{mainframe-menu-more-menu}', 'App.Modules.MainFrame.Icons.MenuIcon', '')
        // )

        $modulesList = App::$moduleManager->list;
        foreach ($modulesList as $module) {
            if (is_object($module) && method_exists($module, 'GetTopmostMenu') && !($module instanceof self)) {
                $items = $module->GetTopmostMenu($hideExecuteCommand);
                if ($items instanceof Item) {
                    $menu->Add($items);
                } elseif (is_array($items)) {
                    foreach ($items as $item) {
                        $menu->Add($item);
                    }
                }
            }
        }

        $menuArray = $menu->ToArray();

        // сохраняем меню в настроечный файл
        $config = new Config($menuArray);
        $config->Save('mainframe-menu.yaml');

        return $menu->children;
    }

    /**
     * Returns a permissions for module
     * @return array
     */
    public function GetPermissions(): array
    {
        $menu = $this->GetTopmostMenu(false);

        $permissions = [];
        $permissions['mainframe'] = '#{mainframe-mainmenu-permissions}';
        foreach ($menu as $item) {
            $permissions['mainframe.' . $item->name] = $item->title;
            foreach ($item->children as $item2) {
                $permissions['mainframe.' . $item->name . '.' . $item2->name] = $item2->title;
                foreach ($item2->children as $item3) {
                    $permissions['mainframe.' . $item->name . '.' . $item2->name . '.' . $item3->name] = $item3->title;
                }
            }
        }

        return $permissions;
    }

    /**
     * Backups module data
     * @param Logger $logger
     * @param string $path
     * @return void
     */
    public function Backup(Logger $logger, string $path)
    {
        // Do nothing        
    }


}