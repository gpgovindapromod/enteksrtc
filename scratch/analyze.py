import os
import re
import json

def analyze_directory(root_dir, skip_dirs=['node_modules', '.git', 'dist', 'build', '.agents']):
    files_data = {}
    
    for dirpath, dirnames, filenames in os.walk(root_dir):
        # Remove skipped directories
        dirnames[:] = [d for d in dirnames if d not in skip_dirs]
        
        for file in filenames:
            if not (file.endswith('.js') or file.endswith('.jsx') or file.endswith('.css') or file.endswith('.json') or file.endswith('.html')):
                continue
                
            filepath = os.path.join(dirpath, file)
            rel_path = os.path.relpath(filepath, root_dir).replace('\\', '/')
            
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
            except Exception as e:
                continue
                
            # Basic static analysis with regex
            imports = re.findall(r'import\s+.*?\s+from\s+[\'"](.*?)[\'"]', content)
            requires = re.findall(r'require\([\'"](.*?)[\'"]\)', content)
            
            # Export finding (basic)
            exports = re.findall(r'export\s+(?:default\s+)?(?:const|let|var|function|class)\s+([a-zA-Z0-9_]+)', content)
            module_exports = re.findall(r'module\.exports\s*=\s*([a-zA-Z0-9_]+)', content)
            
            files_data[rel_path] = {
                'path': rel_path,
                'name': file,
                'imports': imports + requires,
                'exports': exports + module_exports,
                'size': len(content),
                # Just keeping the raw content for quick regex later if needed
            }
            
    return files_data

if __name__ == '__main__':
    project_root = r'C:\Users\HP\Desktop\B-tech\S5\AWT\project\EnteKsrtc'
    data = analyze_directory(project_root)
    with open(os.path.join(project_root, 'scratch', 'analysis.json'), 'w') as f:
        json.dump(data, f, indent=2)
    print("Analysis complete. Processed", len(data), "files.")
