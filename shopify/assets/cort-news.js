(function(){
var t=document.getElementById('ft'),g=document.getElementById('fg'),e=document.getElementById('fe'),i;
if(t&&g){t.addEventListener('click',function(ev){var b=ev.target.closest('button.ccat');if(!b)return;
var bs=t.querySelectorAll('button.ccat');for(i=0;i<bs.length;i++){bs[i].classList.remove('ca');bs[i].classList.add('ci')}
b.classList.add('ca');b.classList.remove('ci');
var f=b.getAttribute('data-f'),n=0,cs=g.querySelectorAll('.fc');
for(i=0;i<cs.length;i++){var ok=f==='all'||cs[i].getAttribute('data-cat')===f;cs[i].style.display=ok?'':'none';if(ok)n++}
if(e)e.style.display=n?'none':'block'})}
var s=document.getElementById('nls');
if(s){s.addEventListener('submit',function(ev){var hp=document.getElementById('nlk1');if(hp&&hp.value)ev.preventDefault()});
if(/[?&]customer_posted=true/.test(location.search)){var d=document.createElement('p');d.className='nlh';d.style.fontSize='20px';d.textContent='You\u2019re in \u2014 welcome to C\u00d8RT News.';s.parentNode.replaceChild(d,s);location.hash='#newsletter'}}
})();