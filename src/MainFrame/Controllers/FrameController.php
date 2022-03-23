<?php

namespace App\Modules\MainFrame\Controllers;

use Colibri\App;
use Colibri\Common\Encoding;
use Colibri\Common\StringHelper;
use Colibri\Data\DataAccessPoint;
use Colibri\Utils\Debug;
use App\Modules\Authorization\Module as AuthModule;
use App\Modules\MainFrame\Module;
use Throwable;

class FrameController extends Controller 
{

    private function _evalArray($children, $taxSettings) 
    {
        $newChildren = [];
        foreach($children as $index => $item) {

            $item['children'] = $this->_evalArray($item['children'], $taxSettings);

            if(isset($item['condition']) && $item['condition']) {
                try {
                    eval('$cond = @'.$item['condition'].';');
                }
                catch(\Exception $e) {
                    $cond = true;
                }

                if($cond) {
                    $newChildren[$index] = $item;    
                }
            } 
            else {
                $newChildren[$index] = $item;
            }


        }
        return $newChildren;
    }
    
    public function Settings($get, $post, $payload) 
    {

        /** @var AuthModule */
        $authModule = App::$moduleManager->authorization;

        $appConfig = App::$config;
        $config = Module::$instance->Config();

        if($authModule->organization) {
            $companyName = $authModule->organization->briefname;
            $taxSettings = $authModule->organization->TaxSettings();
        }
        else {
            $companyName = 'Данные недоступны';
            $taxSettings = null;
        }

        if(!$companyName) {
            $companyName = 'ИНН: '.$authModule->organization->inn;
        }

        $menu = Module::$instance->GetTopmostMenu(true);

        $newMenu = [];
        foreach($menu as $index => $menuItem) {

            $access = $menuItem['access'];

            $buymessage = $config->Query('config.messages.buymessage')->GetValue();
            eval('$buymessage = '.$buymessage.';');

            $bycondition = $config->Query('config.messages.bycondition');

            foreach($bycondition as $condition) {

                $cond = $condition->Query('condition')->GetValue();
                try {
                    eval('$cond = @'.$cond.';');
                }
                catch(\Exception $e) {
                    $cond = true;
                }
                
                $message = $condition->Query('message')->GetValue();
                if($cond) {
                    try {
                        eval('$menuItem[\'message\'] = @'.$message.';');
                        $menuItem['link'] = $condition->Query('link')->GetValue();
                    }
                    catch(\Exception $e) {
                        $menuItem['message'] = ''; 
                    }
                }
            }

            $newMenu[$index] = $menuItem;

        }

        $newMenu = $this->_evalArray($newMenu, $taxSettings);

        try {
            if(App::$request->host == App::$config->Query('hosts.gbs')->GetValue()) {
                $archive = App::$config->Query('hosts.gbsarchive')->GetValue();
            }
            else {
                $archive = App::$config->Query('hosts.boarchive')->GetValue();
            }
        }
        catch(Throwable $e) {
            $archive = 'archive.buhsoft.online';
        }

        $result = array_merge($appConfig->Query('settings')->AsArray(), [
            'mainframe' => [
                'menu' => $newMenu,
                'links' => [
                    (object)[
                        'name' => 'comet',
                        'description' => '<svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.96135 11H14.1291C14.2968 11 14.39 10.806 14.2853 10.6751L12.5452 8.5V6C12.5452 3.79086 10.7544 2 8.54523 2C6.33609 2 4.54523 3.79086 4.54523 6V8.5L2.80518 10.6751C2.70042 10.806 2.79365 11 2.96135 11Z" stroke="white" stroke-width="1.85"/><path d="M8.54523 2V1" stroke="white" stroke-width="1.85" stroke-linecap="round"/><rect x="6.54523" y="13" width="4" height="2" rx="1" fill="white"/></svg><span class="badge"><em>0</em></span>',
                        'index' => '/comet/',
                        'enabled' => true
                    ],
                    (object)[
                        'name' => 'references',
                        'description' => 'Справочная система',
                        'index' => 'https://b.docs247.ru/#/recommendations/',
                        'enabled' => true
                    ],
                    (object)[
                        'name' => 'school',
                        'description' => 'Школа',
                        'index' => 'https://school.buhsoft.ru/',
                        'enabled' => true
                    ],
                    (object)[
                        'name' => 'help',
                        'description' => 'Помощь',
                        'index' => '/need-help/',
                        'enabled' => true
                    ],
                    (object)[
                        'name' => 'archive',
                        'description' => '<svg width="15" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg"><g opacity="0.6"><path d="M4.08937 1.8H11.4248V0.2H4.08937V1.8ZM11.6037 1.91055L12.8304 4.36373L14.2614 3.64813L13.0347 1.19496L11.6037 1.91055ZM2.68379 4.36373L3.91049 1.91055L2.47943 1.19496L1.25273 3.64813L2.68379 4.36373ZM2.75708 13.8H12.7571V12.2H2.75708V13.8ZM14.5571 12V4.90043H12.9571V12H14.5571ZM0.95708 4.90042V12H2.55708V4.90042H0.95708ZM12.7571 13.8C13.7512 13.8 14.5571 12.9941 14.5571 12H12.9571C12.9571 12.1105 12.8675 12.2 12.7571 12.2V13.8ZM2.75708 12.2C2.64662 12.2 2.55708 12.1105 2.55708 12H0.95708C0.95708 12.9941 1.76297 13.8 2.75708 13.8V12.2ZM1.25273 3.64813C1.0583 4.03695 0.95708 4.4657 0.95708 4.90042H2.55708C2.55708 4.71412 2.60046 4.53037 2.68379 4.36373L1.25273 3.64813ZM12.8304 4.36373C12.9137 4.53037 12.9571 4.71412 12.9571 4.90043H14.5571C14.5571 4.4657 14.4559 4.03695 14.2614 3.64813L12.8304 4.36373ZM11.4248 1.8C11.5005 1.8 11.5698 1.8428 11.6037 1.91055L13.0347 1.19496C12.7298 0.585178 12.1066 0.2 11.4248 0.2V1.8ZM4.08937 0.2C3.40761 0.2 2.78435 0.585178 2.47943 1.19496L3.91049 1.91055C3.94437 1.8428 4.01362 1.8 4.08937 1.8V0.2Z" fill="white"></path><path d="M13.3284 5.22847C13.7702 5.22847 14.1284 4.87029 14.1284 4.42847C14.1284 3.98664 13.7702 3.62847 13.3284 3.62847V5.22847ZM2.18555 3.62847C1.74372 3.62847 1.38555 3.98664 1.38555 4.42847C1.38555 4.87029 1.74372 5.22847 2.18555 5.22847V3.62847ZM13.3284 3.62847H2.18555V5.22847H13.3284V3.62847Z" fill="white"></path><path d="M13.7571 9.51436C14.1989 9.51436 14.5571 9.15618 14.5571 8.71436C14.5571 8.27253 14.1989 7.91436 13.7571 7.91436V9.51436ZM1.75708 7.91436C1.31525 7.91436 0.95708 8.27253 0.95708 8.71436C0.95708 9.15618 1.31525 9.51436 1.75708 9.51436V7.91436ZM13.7571 7.91436H1.75708V9.51436H13.7571V7.91436Z" fill="white"></path><rect x="6.04272" y="4.42847" width="3.42857" height="1.71429" rx="0.857143" fill="white"></rect><rect x="6.04272" y="8.71436" width="3.42857" height="1.71429" rx="0.857143" fill="white"></rect></g></svg>',
                        'index' => '/archive/',
                        'enabled' => true
                    ],
                    (object)[
                        'name' => 'company',
                        'description' => '<em>' . $companyName . '</em> <svg width="9" height="5" viewBox="0 0 9 5" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.9574 1L4.95502 4L1.95264 1" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
                        'index' => '/companies/',
                        'enabled' => true
                    ],
                    (object)[
                        'name' => 'profile',
                        'description' => '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="9.00016" cy="7.22135" r="2.66667" stroke="white" stroke-width="1.85"/><circle cx="9" cy="9" r="8" stroke="white" stroke-width="1.85"/><path d="M14.3332 15.2214V15.2214C14.3332 13.7486 13.1393 12.5547 11.6665 12.5547H6.33317C4.86041 12.5547 3.6665 13.7486 3.6665 15.2214V15.2214" stroke="white" stroke-width="1.85"/></svg>',
                        'index' => '/profile/',
                        'enabled' => true
                    ],
                ],
                'archive' => [
                    (object)[
                        'title' => 'message',
                        'route' => 'message',
                    ],
                    (object)[
                        'title' => 'Выберите архив',
                        'route' => '#',
                    ],
                    (object)[
                        'title' => '2020',
                        'route' => 'https://'.$archive.'/2020/',
                    ],
                    (object)[
                        'title' => '2019',
                        'route' => 'https://'.$archive.'/2019/',
                    ],
                    (object)[
                        'title' => '2018',
                        'route' => 'https://'.$archive.'/2018/',
                    ],
                    (object)[
                        'title' => '2017',
                        'route' => 'https://'.$archive.'/2017/',
                    ],
                ],
            ],
            'hosts' => $appConfig->Query('hosts')->AsArray() 
        ]);


        return $this->Finish(200, 'Settings', $result);
    }

    public function Execute($get, $post, $payload) 
    {

        if(!AuthModule::$instance->user) {
            return $this->Finish(403, 'Пользователь не авторизован');
        }

        if(!AuthModule::$instance->organization_data) {
            return $this->Finish(403, 'Пользователь не авторизован');
        }

        $menu = Module::$instance->GetTopmostMenu(false);

        $permissions = [];
        foreach($menu as $item) {
            $item = (object)$item;
            $permissions['app.'.$item->name] = $item->execute;
            if(isset($item->children)) {
                foreach($item->children as $item2) {
                    $item2 = (object)$item2;
                    $permissions['app.'.$item->name.'.'.$item2->name] = $item2->execute;
                    if(isset($item2->children)) {
                        foreach($item2->children as $item3) {
                            $item3 = (object)$item3;
                            $permissions['app.'.$item->name.'.'.$item2->name.'.'.$item3->name] = $item3->execute;
                        }
                    }        
                }
            }
        }

        $route = str_replace('/', '.', trim($post->route, '/'));
        
        if(isset($permissions[$route]) && AuthModule::$instance->organization_data->IsCommandAllowed($route)) {
            return $this->Finish(200, 'Разрешено', ['execute' => $permissions[$route]]);
        }

        return $this->Finish(403, 'Не разрешено');


    }

}