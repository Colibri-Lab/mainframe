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
use Colibri\Common\VariableHelper;
use Colibri\IO\FileSystem\File;
use Colibri\IO\Request\Request;
use Colibri\IO\Request\Type;
use Colibri\Modules\Module as BaseModule;
use Colibri\Utils\Cache\Mem;
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

    
    private string $_fpmRequest;
    private string $_serverRequest;
    private int $_timer;
    private int $_dumpTimer;

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

        $moduleConfig = $this->Config();
        $this->_fpmRequest = $moduleConfig->Query('config.status.fpm')->GetValue();
        $this->_serverRequest = $moduleConfig->Query('config.status.server')->GetValue();
        $this->_timer = $moduleConfig->Query('config.status.timer')->GetValue();
        $this->_dumpTimer = $moduleConfig->Query('config.status.dump-timer')->GetValue();

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

    public function GetStatusWorkerTimer(): int
    {
        return $this->_timer;
    }
    
    public function GetFpmStatus(): ?object 
    {
        $request = new Request($this->_fpmRequest, Type::Get);
        $response = $request->Execute();
        if($response->status !== 200) {
            // error
            return null;
        }

        $result = VariableHelper::Map(json_decode($response->data), function ($key, $value) {
            return [str_replace(' ', '-', $key), $value];
        });
        return (object)$result;
    }

    public function GetServerStatus(): ?object 
    {
        $request = new Request($this->_serverRequest, Type::Get);
        $response = $request->Execute();
        if($response->status !== 200) {
            // error
            return null;
        }

        $statusJson = json_decode($response->data);
        return (object)$statusJson;
    }

    public function GetDatabaseStatus(): ?array
    {

        $objects = [];
        $accessPoints = App::$dataAccessPoints->accessPoints;
        foreach($accessPoints->points as $name => $pv) {
            $point = App::$dataAccessPoints->Get($name);
            $object = [];
            $reader = $point->Query('show status');
            while($r = $reader->Read()) {
                $key = strtolower($r->Variable_name);
                if(strstr($key, 'tls') !== false || strstr($key, 'sha2') !== false) {
                    continue;
                }
                $object[$key] = (int)$r->Value;
            }
            
            $objects[$point->connection->host.':'.$point->connection->port] = $object;

        }
        
        return $objects;
    }

    public function GetStatusInfo(): array
    {
        $runtimePath = App::$appRoot . App::$config->Query('runtime')->GetValue();

        $statusDataFile = $runtimePath . 'status.json';

        if (!Mem::Exists('COLIBRI_STATUS_DATA')) {
            $results = File::Exists($statusDataFile) ? json_decode(File::Read($statusDataFile)) : [];
        } else {
            $results = json_decode(gzuncompress(Mem::Read('COLIBRI_STATUS_DATA')));
        }

        return (array)$results;

    }

    public function RegisterStatusInfo(): object
    {
        $runtimePath = App::$appRoot . App::$config->Query('runtime')->GetValue();

        $statusLastDumpTime = time();
        $statusDataFile = $runtimePath . 'status.json';

        if(File::Exists($statusDataFile)) {
            $f = new File($statusDataFile);
            $statusLastDumpTime = $f->attr_modified;
        }

        $result = ['time' => time()];

        $fpmStatus = Module::$instance->GetFpmStatus();
        if($fpmStatus) {
            $result['fpm'] = $fpmStatus;
        }

        $serverStatus = Module::$instance->GetServerStatus();
        if($serverStatus) {
            $result['server'] = $serverStatus;
        }
        
        $databaseStatus = Module::$instance->GetDatabaseStatus();
        if($databaseStatus) {
            $result['databases'] = array_values($databaseStatus);
        }

        $results = [];
        if(!Mem::Exists('COLIBRI_STATUS_DATA')) {
            $results = File::Exists($statusDataFile) ? json_decode(File::Read($statusDataFile)) : [];
        } else {
            $results = json_decode(gzuncompress(Mem::Read('COLIBRI_STATUS_DATA')));
        }

        $results[] = (object)$result;
        if(count($results) > 50) {
            array_splice($results, 0, count($results) - 50);
        }
        
        $res = Mem::Write('COLIBRI_STATUS_DATA', gzcompress(json_encode($results)));
        if(time() - $statusLastDumpTime > $this->_dumpTimer || !$res) {
            File::Write($statusDataFile, json_encode($results), true);
        }

        return (object)$result;
    }


}