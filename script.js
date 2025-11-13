// 1. 表单提交功能：仅绑定联系方式表单
const contactForm = document.getElementById('contactForm'); // 使用ID选择器
contactForm.addEventListener('submit', function(e) {
  e.preventDefault();
  alert('留言发送成功！我会尽快回复你~');
  contactForm.reset();
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
