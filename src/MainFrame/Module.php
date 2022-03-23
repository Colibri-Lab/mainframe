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
 
    private $_initMenu;
    private $_accessPointName;

    /**
     * Инициализация модуля
     * @return void
     */
    public function InitializeModule()
    {
        self::$instance = $this;
        $this->_initMenu = $this->Config()->Query('config.init-menu')->GetValue();
        $this->_accessPointName = $this->Config()->Query('config.access-point')->GetValue();

    }

    public function GetMenuItems() {
        return $this->_getMenuItems(0, '');
    }
    
    private function _getMenuItems($parentId, $name) {
        
        $menu = [];

        try {
            if($this->_initMenu) {

                App::$monitoring->StartTimer('menu');

                if(Mem::Exists('mainmenu')) {
                    $menu = Mem::Read('mainmenu');
                }

                if(empty($menu)) {

                    $auth = App::$dataAccessPoints->Get($this->_accessPointName);
                    $auth-> Query('set names utf8', ['type' => DataAccessPoint::QueryTypeNonInfo]);
                    $reader = $auth->Query('select * from pu3.structure order by position');                
                    
                    $menu = [];
                    while($item = $reader->Read()) {
                        $item->name = ($name ? $name.'.' : '').$item->name;
                        $item->index = '/'.str_replace('.', '/', $item->name).'/';
                        $item->important = $item->important == 1 ? true : false;
                        $item->children = [];
                        $menu[] = (array)$item;
                    }
    
                    $menu = VariableHelper::ArrayToTree($menu, 0);
                    Mem::ZWrite('mainmenu', $menu);
                }


                App::$monitoring->EndTimer('menu');

            }
            else {
                $menu = [];
            }            
        }
        catch(\Throwable $e) {
            $menu = [];
        }

        return $menu;
    }

    /**
     * Вызывается для получения Меню болванкой
     */
    public function GetTopmostMenu($hideExecuteCommand = true) {
        
        static $menu = [];

        if(!empty($menu)) {
            return $menu;
        }

        list($accesses, $tariffs) = AuthorizationModule::$instance->GetTariffsList();
                
        $menu = $this->_getMenuItems(0, '');
        foreach($menu as $index => $item) {
            
            $item = (object)$item;
            if(isset($item->tariffs)) {
                $item->tariffs = explode(',', $item->tariffs);
            }
            else {
                $item->tariffs = [];
            }
            $item->enabled = AuthorizationModule::$instance->IsCommandAllowed('app.'.$item->name);

            foreach($item->children as $index2 => $item2) {
                $item2 = (object)$item2;
                $item2->index = str_replace('//', '/', $item->index . $item2->index);
                if(isset($item2->tariffs)) {
                    $item2->tariffs = explode(',', $item2->tariffs);
                }
                else {
                    $item2->tariffs = [];
                }
                $item2->enabled = AuthorizationModule::$instance->IsCommandAllowed('app.'.$item->name.'.'.$item2->name);

                foreach($item2->children as $index3 => $item3) {
                    $item3 = (object)$item3;
                    $item3->index = str_replace('//', '/', $item2->index . $item3->index);
                    $item3->enabled = AuthorizationModule::$instance->IsCommandAllowed('app.'.$item->name.'.'.$item2->name.'.'.$item3->name);
                    if(isset($item3->tariffs)) {
                        $item3->tariffs = explode(',', $item3->tariffs);
                    }
                    else {
                        $item3->tariffs = [];
                    }
                    if($hideExecuteCommand) {
                        unset($item3->execute);
                    }

                    $item3Access = AuthorizationModule::$instance->GetItemAccessByTariffs($accesses, $tariffs, $item3->tariffs);
                    if(!$item3Access) {
                        $item3->enabled = false;
                        $item3->access = null;
                    }
                    else {
                        $item3->enabled = $item3->enabled && !$item3Access->archive;
                        $item3->access = (object)$item3Access;
                    }
                    $item2->children[$index3] = (array)$item3;

                }

                if($hideExecuteCommand) {
                    unset($item2->execute);
                }      
                
                $item2Access = AuthorizationModule::$instance->GetItemAccessByTariffs($accesses, $tariffs, $item2->tariffs);
                if(!$item2Access) {
                    $item2->enabled = false;
                    $item2->access = null;
                }
                else {
                    $item2->enabled = $item2->enabled && !$item2Access->archive;
                    $item2->access = (object)$item2Access;
                }
                $item->children[$index2] = (array)$item2;

            }

            if($hideExecuteCommand) {
                unset($item->execute);
            }            
            
            $itemAccess = AuthorizationModule::$instance->GetItemAccessByTariffs($accesses, $tariffs, $item->tariffs);
            if(!$itemAccess) {
                $item->enabled = false;
                $item->access = null;
            }
            else {
                $item->enabled = $item->enabled && !$itemAccess->archive;
                $item->access = (object)$itemAccess;
            }
            $menu[$index] = (array)$item;

        }

        return $menu;
    }
 

}