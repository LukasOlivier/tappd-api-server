<?php

namespace App\Http\Controllers;
use App\Modules\Services\UserService;
use Exception;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\Request;
use Nette\Schema\ValidationException;

class AuthController extends Controller
{
    private UserService $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    public function register(Request $request)
    {
       return $this->userService->registerUser($request->all());
    }

    public
    function login(Request $request)
    {
        try {
            $token = $this->userService->login($request->only('email', 'password'));
            return response()->json([
                "authorisation" => ['token' => $token, 'type' => "bearer"],
                "data" => auth()->user()
            ])->withCookie(
                'token',
                $token,
                config('jwt.ttl'),
                '/',
                null,
                true,
                true,
                false,
                "None");
        }catch (AuthenticationException $e){
            return response()->json(['message' => "Invalid credentials"], 400);
        }catch (ValidationException $e){
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }
}
