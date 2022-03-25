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
    public static $instance = null;

    /**
     * Инициализация модуля
     * @return void
     */
    public function InitializeModule()
    {
        self::$instance = $this;

    }

    /**
     * Вызывается для получения Меню болванкой
     */
    public function GetTopmostMenu($hideExecuteCommand = true) {
        
        $menu = Item::Create('app', 'Приложение', '', false, '');
        $modulesList = App::$moduleManager->list;
        foreach($modulesList as $module) {
            if(is_object($module) && method_exists($module, 'GetTopmostMenu') && !($module instanceof self)) {
                $menu->Add($module->GetTopmostMenu($hideExecuteCommand));
            }
        }

        return $menu->children;
    }
 

}