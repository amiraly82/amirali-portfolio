import os
import sys
import re
from http.server import HTTPServer, SimpleHTTPRequestHandler

PORT = 8000

class RangeHTTPRequestHandler(SimpleHTTPRequestHandler):
    def send_head(self):
        path = self.translate_path(self.path)
        if os.path.isdir(path):
            parts = sys.version_info
            for index in "index.html", "index.htm":
                index = os.path.join(path, index)
                if os.path.exists(index):
                    path = index
                    break
            else:
                return super().send_head()

        ctype = self.guess_type(path)
        try:
            f = open(path, 'rb')
        except OSError:
            self.send_error(404, "File not found")
            return None

        fs = os.fstat(f.fileno())
        total = fs[6]

        range_header = self.headers.get('Range')
        if range_header:
            m = re.match(r'bytes=(\d+)-(\d+)?', range_header)
            if m:
                start = int(m.group(1))
                end = int(m.group(2)) if m.group(2) else total - 1
                if start >= total:
                    self.send_error(416, "Requested Range Not Satisfiable")
                    f.close()
                    return None
                length = end - start + 1
                self.send_response(206)
                self.send_header("Content-Type", ctype)
                self.send_header("Content-Range", f"bytes {start}-{end}/{total}")
                self.send_header("Content-Length", str(length))
                self.send_header("Accept-Ranges", "bytes")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                f.seek(start)
                self._range_end = end
                return f

        self.send_response(200)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(total))
        self.send_header("Accept-Ranges", "bytes")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self._range_end = total - 1
        return f

    def copyfile(self, source, outputfile):
        if not hasattr(self, '_range_end'):
            super().copyfile(source, outputfile)
            return

        end = self._range_end
        cur = source.tell()
        remaining = end - cur + 1
        chunk_size = 64 * 1024
        while remaining > 0:
            to_read = min(remaining, chunk_size)
            buf = source.read(to_read)
            if not buf:
                break
            outputfile.write(buf)
            remaining -= len(buf)

if __name__ == '__main__':
    server_address = ('', PORT)
    httpd = HTTPServer(server_address, RangeHTTPRequestHandler)
    print(f"\n🚀 Amirali Easy Portfolio Server running at http://localhost:{PORT}/\n")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server.")
        httpd.server_close()
