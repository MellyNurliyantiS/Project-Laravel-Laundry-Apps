<?php

use App\Http\Controllers\Admin\OutletController;
use App\Http\Controllers\Admin\ServiceController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ReportController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\InvitationCodeController;

Route::get('/', function () {
    return inertia('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('customers', [CustomerController::class, 'index'])->name('customers.index');
    Route::post('customers', [CustomerController::class, 'store'])->name('customers.store');
    Route::put('customers/{customer}', [CustomerController::class, 'update'])->name('customers.update');
    Route::delete('customers/{customer}', [CustomerController::class, 'destroy'])->name('customers.destroy');

    Route::get('orders', [OrderController::class, 'index'])->name('orders.index');
    Route::get('orders/create', [OrderController::class, 'create'])->name('orders.create');
    Route::post('orders', [OrderController::class, 'store'])->name('orders.store');
    Route::get('orders/{order}', [OrderController::class, 'show'])->name('orders.show');
    Route::patch('orders/{order}/status', [OrderController::class, 'updateStatus'])->name('orders.update-status');

    Route::post('orders/{order}/payments', [PaymentController::class, 'store'])->name('payments.store');
});

Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('outlets', [OutletController::class, 'index'])->name('outlets.index');
    Route::post('outlets', [OutletController::class, 'store'])->name('outlets.store');
    Route::put('outlets/{outlet}', [OutletController::class, 'update'])->name('outlets.update');
    Route::delete('outlets/{outlet}', [OutletController::class, 'destroy'])->name('outlets.destroy');

    Route::get('services', [ServiceController::class, 'index'])->name('services.index');
    Route::post('services', [ServiceController::class, 'store'])->name('services.store');
    Route::put('services/{service}', [ServiceController::class, 'update'])->name('services.update');
    Route::delete('services/{service}', [ServiceController::class, 'destroy'])->name('services.destroy');

    Route::get('reports', [ReportController::class, 'index'])->name('reports.index');
    Route::get('reports/today', [ReportController::class, 'today'])->name('reports.today');

    Route::get('users', [UserController::class, 'index'])->name('users.index');
    Route::post('users', [UserController::class, 'store'])->name('users.store');
    Route::put('users/{user}', [UserController::class, 'update'])->name('users.update');
    Route::delete('users/{user}', [UserController::class, 'destroy'])->name('users.destroy');

    Route::get('invitation-codes', [InvitationCodeController::class, 'index'])->name('invitation-codes.index');
    Route::post('invitation-codes', [InvitationCodeController::class, 'store'])->name('invitation-codes.store');
    Route::delete('invitation-codes/{invitationCode}', [InvitationCodeController::class, 'destroy'])->name('invitation-codes.destroy');
});

require __DIR__.'/settings.php';