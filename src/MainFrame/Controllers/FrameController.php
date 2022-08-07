<?php

namespace App\Modules\MainFrame\Controllers;

use App\Modules\MainFrame\Module;
use Colibri\Web\PayloadCopy;
use Colibri\Web\RequestCollection;

class FrameController extends Controller

{

    public function Settings(RequestCollection $get, RequestCollection $post, ?PayloadCopy $payload = null): object
    {

        $mainframeConfig = Module::$instance->Config();

        $menu = Module::$instance->GetTopmostMenu(true);
        
        $config = $mainframeConfig->Query('config')->AsArray();
        unset($config['texts']);
        
        $result = array_merge(
            $config, 
            [
                'menu' => $menu,
                'links' => [
                    (object)[
                        'name' => 'comet',
                        'title' => '<svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.96135 11H14.1291C14.2968 11 14.39 10.806 14.2853 10.6751L12.5452 8.5V6C12.5452 3.79086 10.7544 2 8.54523 2C6.33609 2 4.54523 3.79086 4.54523 6V8.5L2.80518 10.6751C2.70042 10.806 2.79365 11 2.96135 11Z" stroke="white" stroke-width="1.85"/><path d="M8.54523 2V1" stroke="white" stroke-width="1.85" stroke-linecap="round"/><rect x="6.54523" y="13" width="4" height="2" rx="1" fill="white"/></svg><span class="badge"><em>0</em></span>',
                        'index' => '/comet/',
                        'enabled' => true
                    ],
                    (object)[
                        'name' => 'help',
                        'title' => 'Помощь',
                        'index' => '/need-help/',
                        'enabled' => true
                    ],
                    (object)[
                        'name' => 'profile',
                        'title' => '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="9.00016" cy="7.22135" r="2.66667" stroke="white" stroke-width="1.85"/><circle cx="9" cy="9" r="8" stroke="white" stroke-width="1.85"/><path d="M14.3332 15.2214V15.2214C14.3332 13.7486 13.1393 12.5547 11.6665 12.5547H6.33317C4.86041 12.5547 3.6665 13.7486 3.6665 15.2214V15.2214" stroke="white" stroke-width="1.85"/></svg>',
                        'index' => '/lk/',
                        'enabled' => true
                    ],
                ],
            ]
        );

        return $this->Finish(200, 'Settings', $result);
    }

    public function Execute(RequestCollection $get, RequestCollection $post, ?PayloadCopy $payload = null): object
    {

        $userModule = Module::$instance->UserModule();
        if (!$userModule->current) {
            return $this->Finish(403, 'Пользователь не авторизован');
        }

        $menu = Module::$instance->GetTopmostMenu(false);

        $permissions = [];
        foreach ($menu as $item) {
            $permissions['mainframe.' . $item->name] = $item->execute;
            foreach ($item->children as $item2) {
                $permissions['mainframe.' . $item->name . '.' . $item2->name] = $item2->execute;
                foreach ($item2->children as $item3) {
                    $permissions['mainframe.' . $item->name . '.' . $item2->name . '.' . $item3->name] = $item3->execute;
                }
            }
        }

        $route = str_replace('/', '.', trim($post->route, '/'));

        if (isset($permissions[$route]) && $userModule->current->IsCommandAllowed($route)) {
            return $this->Finish(200, 'Разрешено', ['execute' => $permissions[$route]]);
        }

        return $this->Finish(403, 'Не разрешено');


    }

}