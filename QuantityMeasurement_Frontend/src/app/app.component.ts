import { Component, OnInit, AfterViewInit } from '@angular/core';
import { AuthService } from './core/services/auth.service';
import { ToastService } from './core/services/toast.service';
import { Toast } from './core/models';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  toasts: Toast[] = [];

  constructor(
    private auth: AuthService,
    public toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadSavedTheme();
    this.auth.restoreSession();
    this.toastService.toasts$.subscribe(t => this.toasts = t);
  }

  ngAfterViewInit(): void {
    this.initParticles();
  }

  removeToast(id: number): void {
    this.toastService.remove(id);
  }

  private loadSavedTheme(): void {
    const saved = localStorage.getItem('qm_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
  }

  private initParticles(): void {
    const canvas = document.getElementById('particleCanvas') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let particles: any[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const create = () => {
      particles = [];
      const count = Math.floor((canvas.width * canvas.height) / 18000);
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          size: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.4 + 0.1,
          color: ['#a78bfa', '#67e8f9', '#f472b6'][Math.floor(Math.random() * 3)]
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      requestAnimationFrame(animate);
    };

    resize(); create(); animate();
    window.addEventListener('resize', () => { resize(); create(); });
  }
}
