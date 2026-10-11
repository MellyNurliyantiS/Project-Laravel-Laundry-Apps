<?php
namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use App\Models\Outlet;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class UserController extends Controller {
    public function index() {
        return Inertia::render('admin/users', [
            'users' => User::with('outlet:id,name')->orderBy('name')->get(),
            'outlets' => Outlet::orderBy('name')->get(['id', 'name']),
        ]);
    }
    public function store(Request $request) {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => ['required', Password::min(8)],
            'role' => 'required|in:admin,kasir',
            'outlet_id' => 'nullable|exists:outlets,id',
        ]);
        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'outlet_id' => $validated['outlet_id'] ?? null,
        ]);
        return redirect()->route('admin.users.index')->with('success', 'User berhasil ditambahkan.');
    }
    public function update(Request $request, User $user) {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,'.$user->id,
            'role' => 'required|in:admin,kasir',
            'outlet_id' => 'nullable|exists:outlets,id',
            'password' => ['nullable', Password::min(8)],
        ]);
        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
            'outlet_id' => $validated['outlet_id'] ?? null,
        ]);
        if (!empty($validated['password'])) {
            $user->update(['password' => Hash::make($validated['password'])]);
        }
        return redirect()->route('admin.users.index')->with('success', 'User berhasil diperbarui.');
    }
    public function destroy(User $user) {
        if ($user->id === auth()->id()) {
            return redirect()->route('admin.users.index')->with('error', 'Tidak bisa menghapus akun sendiri.');
        }
        try { $user->delete(); }
        catch (QueryException $e) {
            return redirect()->route('admin.users.index')->with('error', 'User tidak bisa dihapus karena masih punya transaksi terkait.');
        }
        return redirect()->route('admin.users.index')->with('success', 'User berhasil dihapus.');
    }
}