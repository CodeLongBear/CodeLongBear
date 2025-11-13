// 1. 表单提交功能：防止刷新，提示成功
const form = document.querySelector('form');
form.addEventListener('submit', function(e) {
  e.preventDefault(); // 阻止表单默认提交（刷新页面）
  alert('留言发送成功！我会尽快回复你~');
  form.reset(); // 清空表单
});

// 2. 平滑滚动：点击导航栏跳转到对应区块
document.querySelectorAll('nav a').forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    document.querySelector(targetId).scrollIntoView({
      behavior: 'smooth' // 平滑滚动效果
    });
  });
});

// 3. 技能项hover动画：放大效果
document.querySelectorAll('.skill-item').forEach(item => {
  item.addEventListener('mouseover', function() {
    this.style.transform = 'scale(1.1)';
    this.style.transition = 'transform 0.3s';
  });
  item.addEventListener('mouseout', function() {
    this.style.transform = 'scale(1)';
  });
});