<?php

namespace App\Modules\MainFrame\Threading;
use App\Modules\MainFrame\Module;
use Colibri\Common\VariableHelper;
use Colibri\IO\Request\Request;
use Colibri\IO\Request\Type;
use Colibri\Threading\Worker as BaseWorker;
use Colibri\Utils\Logs\MemoryLogger;
use Colibri\Events\EventsContainer;
use CometApiClient\Client;
use Colibri\App;
use Throwable;

class StatusWorker extends BaseWorker
{

    private string $_fpmRequest;
    private string $_serverRequest;
    private int $_timer;

    public function __construct(int $timeLimit = 0, int $prio = 0, string $key = '')
    {
        parent::__construct($timeLimit, $prio, $key);

        $moduleConfig = Module::$instance->Config();
        $this->_fpmRequest = $moduleConfig->Query('config.status.fpm')->GetValue();
        $this->_serverRequest = $moduleConfig->Query('config.status.server')->GetValue();
        $this->_timer = $moduleConfig->Query('config.status.timer')->GetValue();

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

    public function Run(): void
    {

        $user = $this->_params->user;
        $requester = $this->_params->requester;

        $cometConfig = App::$config->Query('comet')->AsObject();
        $comet = new Client($cometConfig->host, $cometConfig->port);


        while(true) {

            $fpmStatus = $this->GetFpmStatus();
            if(!$fpmStatus) {
                $comet->SendToUser($requester, $user, 'status', (object)['error' => 'Can not get fpm status']);
                exit;
            }

            $serverStatus = $this->GetServerStatus();
            if(!$serverStatus) {
                $comet->SendToUser($requester, $user, 'status', (object)['error' => 'Can not get server status']);
                exit;
            }

            $databaseStatus = $this->GetDatabaseStatus();
            if(!$databaseStatus) {
                $comet->SendToUser($requester, $user, 'status', (object)['error' => 'Can not get server status']);
                exit;
            }

            $result = (object) ['fpm' => $fpmStatus, 'server' => $serverStatus, 'databases' => array_values($databaseStatus)];

            $comet->SendToUser($requester, $user, 'status', $result);

            sleep($this->_timer);
        }
        
        

    }
}