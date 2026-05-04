from pathlib import Path
import re

path = Path('composer.lock')
text = path.read_text(encoding='utf-8')
pattern = re.compile(r'<<<<<<< HEAD\n(.*?)\n=======\n(.*?)\n>>>>>>> ee35df6bb1bb1d79fb0e9f05e76f6703d9f103\n', re.S)
new_text, count = pattern.subn(lambda m: m.group(2) + '\n', text)
print(f'Replaced {count} conflict block(s)')
path.write_text(new_text, encoding='utf-8')
