// ===== 全局变量 =====
const BACKEND_URL = "http://localhost:8080";

// ===== DOM 加载完成后执行 =====
document.addEventListener('DOMContentLoaded', function() {
  initNavigation();
  initScrollEffects();
  initContactForm();
  initMessageBoard();
  initBackToTop();
  initAnimations();
  initRedirectAnimation(); // 初始化跳转动画
  checkBackendHealth(); // 检查后端健康状态
});

// ===== 检查后端健康状态 =====
function checkBackendHealth() {
  console.log('[健康检查] 开始检查后端服务状态...');
  fetch(`${BACKEND_URL}/api/health`, {
    method: 'GET',
    headers: {
      'Cache-Control': 'no-cache'
    }
  })
  .then(res => res.json())
  .then(response => {
    console.log('[健康检查] 后端状态:', response);
    if (response.success && response.data) {
      const dbInfo = response.data.database;
      if (dbInfo.status === '已连接') {
        console.log('✅ 后端服务正常，数据库已连接');
        console.log(`   数据库: ${dbInfo.product} ${dbInfo.version}`);
      } else {
        console.warn('⚠️ 后端服务运行中，但数据库未连接');
        console.warn(`   错误: ${dbInfo.error || '未知错误'}`);
      }
    }
  })
  .catch(err => {
    console.error('❌ 无法连接到后端服务:', err.message);
    console.error('   请确认后端服务已启动在:', BACKEND_URL);
  });
}

// ===== 导航栏功能 =====
function initNavigation() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  // 滚动时改变导航栏样式
  window.addEventListener('scroll', function() {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // 移动端菜单切换
  if (hamburger) {
    hamburger.addEventListener('click', function() {
      navMenu.classList.toggle('active');
      hamburger.classList.toggle('active');
    });
  }

  // 点击导航链接后关闭移动端菜单
  navLinks.forEach(link => {
    link.addEventListener('click', function() {
      navMenu.classList.remove('active');
      hamburger.classList.remove('active');
    });
  });

  // 平滑滚动
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetSection = document.querySelector(targetId);
      
      if (targetSection) {
        const offsetTop = targetSection.offsetTop - 70;
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    });
  });
}

// ===== 滚动效果 =====
function initScrollEffects() {
  const sections = document.querySelectorAll('.section');
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  };

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  sections.forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
  });
}

// ===== 联系表单 =====
function initContactForm() {
  const contactForm = document.getElementById('contactForm');
  
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const formData = {
        name: this.name.value,
        email: this.email.value,
        message: this.message.value
      };

      // 这里可以添加实际的表单提交逻辑
      // 例如发送到后端API
      console.log('表单数据:', formData);
      
      // 显示成功消息
      showNotification('消息发送成功！我会尽快回复你~', 'success');
      
      // 重置表单
      this.reset();
    });
  }
}

// ===== 留言板功能 =====
function initMessageBoard() {
  const messageForm = document.getElementById('githubMessageForm');
  
  if (messageForm) {
    // 提交留言
    messageForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const message = {
        name: this.name.value,
        email: this.email.value,
        content: this.content.value
      };

      // 提交到后端
      console.log('[留言提交] 开始提交:', message);
      fetch(`${BACKEND_URL}/api/message`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(message)
      })
      .then(res => {
        console.log(`[留言提交] 响应状态: ${res.status} ${res.statusText}`);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then(response => {
        console.log('[留言提交] 响应数据:', response);
        if (response.success) {
          showNotification(response.message || '留言成功！', 'success');
          this.reset();
          loadMessages(); // 刷新留言列表
        } else {
          showNotification(response.message || '留言失败', 'error');
        }
      })
      .catch(err => {
        console.error('[留言提交] 错误详情:', err);
        showNotification('留言失败：' + err.message + '\n请确认后端已启动，且地址正确', 'error');
      });
    });

    // 页面加载时加载留言
    loadMessages();
  }
}

// ===== 加载留言列表 =====
function loadMessages() {
  const messageList = document.getElementById('githubMessageList');
  const messageCount = document.getElementById('githubMessageCount');
  
  if (!messageList) return;

  // 添加时间戳防止浏览器缓存
  const timestamp = new Date().getTime();
  console.log(`[留言加载] 开始请求: ${BACKEND_URL}/api/messages?t=${timestamp}`);
  
  fetch(`${BACKEND_URL}/api/messages?t=${timestamp}`, {
    method: 'GET',
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  })
    .then(res => {
      console.log(`[留言加载] 响应状态: ${res.status} ${res.statusText}`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      return res.json();
    })
    .then(response => {
      console.log('[留言加载] 响应数据:', response);
      
      if (!response.success) {
        throw new Error(response.message || '获取留言失败');
      }
      
      const messages = response.data || [];
      console.log(`[留言加载] 成功获取 ${messages.length} 条留言`);
      
      if (messageCount) {
        messageCount.textContent = messages.length;
      }
      
      messageList.innerHTML = '';
      
      if (messages.length === 0) {
        messageList.innerHTML = '<p style="text-align: center; color: #999; padding: 2rem;">暂无留言，快来成为第一个留言的人吧！</p>';
        return;
      }

      // 渲染每条留言
      messages.forEach(msg => {
        const messageItem = document.createElement('div');
        messageItem.className = 'message-item';
        
        // 格式化时间
        let formatTime = '';
        if (msg.createTime) {
          formatTime = msg.createTime.split('T').join(' ').split('.')[0];
        }
        
        messageItem.innerHTML = `
          <p><strong>${escapeHtml(msg.name)}</strong> <span style="color: #999; font-size: 0.9rem;">(${escapeHtml(msg.email)})</span></p>
          <p>${escapeHtml(msg.content)}</p>
          ${formatTime ? `<p class="message-time">${formatTime}</p>` : ''}
        `;
        
        messageList.appendChild(messageItem);
      });
    })
    .catch(err => {
      console.error('[留言加载] 错误详情:', err);
      messageList.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: #999;">
          <p>未能加载留言：${err.message}</p>
          <p style="font-size: 0.9rem; margin-top: 0.5rem;">请确认后端服务已启动且数据库连接正常</p>
          <p style="font-size: 0.8rem; margin-top: 0.5rem; color: #666;">检查浏览器控制台（F12）查看详细错误信息</p>
        </div>
      `;
      if (messageCount) {
        messageCount.textContent = '0';
      }
    });
}

// ===== 返回顶部按钮 =====
function initBackToTop() {
  const backToTopBtn = document.getElementById('backToTop');
  
  if (backToTopBtn) {
    window.addEventListener('scroll', function() {
      if (window.scrollY > 300) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    });

    backToTopBtn.addEventListener('click', function() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
}

// ===== 动画效果 =====
function initAnimations() {
  // 技能卡片动画
  const skillCards = document.querySelectorAll('.skill-card');
  skillCards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.1}s`;
  });

  // 项目卡片动画
  const projectCards = document.querySelectorAll('.project-card');
  projectCards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.15}s`;
  });
}

// ===== 跳转动画功能 =====
function initRedirectAnimation() {
  const projectLinks = document.querySelectorAll('.project-link');
  const overlay = document.getElementById('redirect-overlay');
  
  if (projectLinks.length > 0 && overlay) {
    projectLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        // 阻止默认跳转
        e.preventDefault();
        
        // 显示遮罩层
        overlay.classList.add('active');
        
        // 获取目标URL
        const targetUrl = this.getAttribute('href');
        
        // 1.5秒后跳转
        setTimeout(() => {
          window.open(targetUrl, '_blank');
          // 动画播放完成后隐藏遮罩层
          setTimeout(() => {
            overlay.classList.remove('active');
          }, 500);
        }, 1500);
      });
    });
  }
}

// ===== 工具函数 =====

// 显示通知
function showNotification(message, type = 'success') {
  // 创建通知元素
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  // 添加样式
  notification.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    background: ${type === 'success' ? '#10b981' : '#ef4444'};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 10px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    z-index: 10000;
    animation: slideInRight 0.3s ease;
    max-width: 400px;
    word-wrap: break-word;
  `;
  
  document.body.appendChild(notification);
  
  // 3秒后自动移除
  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// HTML转义，防止XSS攻击
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ===== 添加通知动画样式 =====
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);


document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // 获取表单数据
    const formData = new FormData(this);
    const contactData = {
        name: formData.get('name'),
        email: formData.get('email'),
        message: formData.get('message')
    };
    
    // 发送 AJAX 请求
    fetch('http://localhost:8080/api/contact/send', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(contactData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('消息发送成功！');
            this.reset(); // 重置表单
        } else {
            alert('发送失败：' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('网络错误，请稍后重试');
    });
});
