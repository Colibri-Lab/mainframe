<?php



/**
 * Search
 *
 * @author Author Name <author.name@action-media.ru>
 * @copyright 2019 Colibri
 * @package App\Modules\MainFrame
 */
namespace App\Modules\MainFrame;


use Colibri\App;
use Colibri\Common\VariableHelper;
use Colibri\Data\DataAccessPoint;
use Colibri\Modules\Module as BaseModule;
use Colibri\Utils\Cache\Mem;
use Colibri\Utils\Debug;
use App\Modules\Authorization\Module as AuthorizationModule;
use App\Modules\MainFrame\Controllers\Controller;
use Colibri\Utils\Menu\Item;
use Colibri\Utils\Config\ConfigException;
use Colibri\Utils\Config\Config;


/**
 * Описание модуля
 * @package App\Modules\MainFrame
 *
 *
 */
class Module extends BaseModule
{

    /**
     * Синглтон
     *
     * @var Module
     */
    public static ?Module $instance = null;

    private mixed $_userModule = null;

    /**
     * Инициализация модуля
     * @return void
     */
    public function InitializeModule(): void
    {
        self::$instance = $this;

    }

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
     * Вызывается для получения Меню болванкой
     */
    public function GetTopmostMenu(bool $hideExecuteCommand = true): Item|array
    {

        try {
            $menu = Module::$instance->Config()->Query('config.menu')->AsArray();
        }
        catch(ConfigException $e) {
            $menu = null;
        }

        if(!$menu) {
            $menu = Item::Create('mainframe', 'Приложение', 'Функции приложения', '', false, '');
        }
        else {
            $menu = Item::FromArray($menu);
        }

        $menu->Add(Item::Create('more', 'ЕЩЕ', '', '', false, '')->Add(
            Item::Create('tools', 'Инструменты', '', '', false, '')->Add(
                Item::Create('menu', 'Редактор меню', 'Редактор древовидного меню панели администратора. Можно поменять местами, скрыть или отобразить некоторые пункты', '', true, 'MainFrame.RouteTo("/menu/")')
            )
        ));

        $modulesList = App::$moduleManager->list;
        foreach ($modulesList as $module) {
            if (is_object($module) && method_exists($module, 'GetTopmostMenu') && !($module instanceof self)) {
                $items = $module->GetTopmostMenu($hideExecuteCommand);
                if($items instanceof Item) {
                    $menu->Add($items);
                }
                else if(is_array($items)) {
                    foreach($items as $item) {
                        $menu->Add($item);
                    }
                }
            }
        }

        // сохраняем меню в настроечный файл
        $config = new Config($menu->ToArray());
        $config->Save('mainframe-menu.yaml');

        return $menu->children;
    }

    public function GetPermissions(): array
    {
        $menu = $this->GetTopmostMenu(false);

        $permissions = [];
        $permissions['mainframe'] = 'Основное меню';
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



}