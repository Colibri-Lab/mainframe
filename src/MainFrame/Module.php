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

        $menu = Item::Create('mainframe', 'Приложение', '', false, '');
        $modulesList = App::$moduleManager->list;
        foreach ($modulesList as $module) {
            if (is_object($module) && method_exists($module, 'GetTopmostMenu') && !($module instanceof self)) {
                $menu->Add($module->GetTopmostMenu($hideExecuteCommand));
            }
        }

        return $menu->children;
    }

    public function GetPermissions(): array
    {
        $menu = $this->GetTopmostMenu(false);

        $permissions = [];
        $permissions['mainframe'] = 'Основное окно';
        foreach ($menu as $item) {
            $permissions['mainframe.' . $item->name] = $item->description;
            foreach ($item->children as $item2) {
                $permissions['mainframe.' . $item->name . '.' . $item2->name] = $item2->description;
                foreach ($item2->children as $item3) {
                    $permissions['mainframe.' . $item->name . '.' . $item2->name . '.' . $item3->name] = $item3->description;
                }
            }
        }

        return $permissions;
    }



}