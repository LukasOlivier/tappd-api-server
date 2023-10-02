<?php

namespace App\Modules\Services;

use App\Models\User;
use Couchbase\QueryException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Nette\Schema\ValidationException;
use PHPUnit\Exception;

class UserService
{

    protected User $model;


    private $registerRules = [
        'email' => 'required|string|email|max:255|unique:users',
        'password' => 'required|string|min:6',
    ];

    private $loginRules = [
        'email' => 'required|string|email',
        'password' => 'required',
    ];


    public function __construct(User $model)
    {
        $this->model = $model;
    }

    public function registerUser(array $data)
    {
        try {
            $validator = Validator::make($data, $this->registerRules);
            if ($validator->fails()){
                throw new ValidationException("Invalid data");
            }
            $data['password'] = Hash::make($data['password']);
            return response()->json([
                'message' => 'User creation successful',
                'data' => $this->model->create($data)
            ], 200);


        }catch (Exception| ValidationException $exception){
            return response()->json([
                'message' => 'Data is not valid or user already exists',
                'error' => $exception->getMessage()
            ], 400);
        }
    }

    public function login($credentials): ?string
    {
        $validator = Validator::make($credentials, $this->loginRules);
        if ($validator->fails()) throw new ValidationException($validator->errors());
        $token = auth()->attempt($credentials);
        if ($token == null) throw new AuthenticationException("Wrong credentials");
        return $token;
    }

}
