"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Car, LockKeyhole, User } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      username,
      password,
    });

    if (res?.error) {
      setError("Credenciales incorrectas. Verificá tu usuario y contraseña.");
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="flex min-h-screen bg-[#050505] text-white">
      {/* Left Panel - Branding & Visuals */}
      <div className="hidden lg:flex flex-col w-1/2 relative overflow-hidden border-r border-[#222]">
        {/* Background Gradient & Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-900/20 via-[#050505] to-black z-0" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-yellow-600/10 via-transparent to-transparent z-0" />
        
        {/* Abstract shapes / glow */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-yellow-600/10 rounded-full blur-[100px]" />

        <div className="relative z-10 flex flex-col justify-between h-full p-16">
          <div className="flex items-center gap-4">
            <Image src="/logo.png" alt="Rodmell Automotores" width={180} height={60} className="object-contain drop-shadow-[0_0_15px_rgba(234,179,8,0.2)]" priority />
          </div>
          
          <div className="space-y-6">
            <h1 className="text-5xl font-extrabold tracking-tight leading-[1.1] bg-gradient-to-br from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
              Gestión SaaS <br />
              Premium para <br />
              <span className="text-yellow-500">Concesionarias</span>
            </h1>
            <p className="text-zinc-400 text-lg max-w-md leading-relaxed">
              Plataforma integral diseñada para optimizar tu inventario de vehículos, acelerar tus ventas y fidelizar a tus clientes.
            </p>
          </div>

          <div className="flex items-center gap-4 text-zinc-500 text-sm font-medium tracking-wider uppercase">
            <Car className="w-5 h-5 text-yellow-500" />
            Control Absoluto
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-500/5 via-black to-black z-0 lg:hidden" />
        
        <div className="w-full max-w-md space-y-8 relative z-10">
          <div className="text-center lg:text-left space-y-2">
            <div className="lg:hidden flex justify-center mb-8">
              <Image src="/logo.png" alt="Rodmell" width={200} height={60} className="object-contain" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white">Iniciar Sesión</h2>
            <p className="text-zinc-400">Ingresá tus credenciales para acceder al sistema.</p>
          </div>

          <div className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-[#222] rounded-3xl p-8 shadow-2xl shadow-black/50 relative overflow-hidden">
            {/* Subtle inner glow */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-500/20 to-transparent" />
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-zinc-400 font-medium ml-1">Usuario</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-zinc-500" />
                  </div>
                  <Input
                    id="username"
                    placeholder="admin"
                    className="pl-10 bg-[#111] border-[#333] text-white focus-visible:ring-yellow-500 focus-visible:border-yellow-500 h-12 rounded-xl"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-zinc-400 font-medium ml-1">Contraseña</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockKeyhole className="h-5 w-5 text-zinc-500" />
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10 bg-[#111] border-[#333] text-white focus-visible:ring-yellow-500 focus-visible:border-yellow-500 h-12 rounded-xl"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-500 flex items-center justify-center animate-in fade-in zoom-in duration-300">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black font-bold h-12 rounded-xl transition-all shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/40"
                disabled={loading}
              >
                {loading ? "Verificando identidad..." : "Acceder al Panel"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
