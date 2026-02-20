require 'mathtype_to_mathml_plus'
require 'json'
require 'thread'
require 'digest'

MAX_THREADS = 4
CHUNK_SIZE = 5

def process_file(file_path)
  begin
    unless File.exist?(file_path) && File.readable?(file_path)
      return [file_path, "<!-- ERROR: File not accessible -->"]
    end

    file_size = File.size(file_path)
    return [file_path, "<!-- ERROR: File too large -->"] if file_size > 10_485_760
    return [file_path, "<!-- ERROR: Empty file -->"] if file_size == 0

    converter = MathTypeToMathMLPlus::Converter.new(file_path)
    mathml = converter.convert

    if mathml.nil? || mathml.strip.empty?
      return [file_path, "<!-- ERROR: Empty conversion result -->"]
    end

    mathml = clean_mathml(mathml)

    [file_path, mathml]

  rescue StandardError => e
    [file_path, "<!-- ERROR: #{e.message.gsub(/[<>]/, '_')} -->"]
  end
end

def clean_mathml(mathml)
  return mathml unless mathml.is_a?(String)

  # Xoá ký tự lạ
  mathml = mathml.delete("\u2009")        # thin space
  mathml = mathml.gsub("\u00A0", " ")     # non-breaking space → space

  # Xoá thẻ rỗng
  mathml = mathml.gsub(/<mtext>\s*<\/mtext>/, '')

  # Xoá display="block"
  mathml = mathml.gsub(/\s*display="block"/, '')

  # Xoá display="inline" nếu có (optional)
  mathml = mathml.gsub(/\s*display="inline"/, '')

  # Loại bỏ dấu xuống dòng dư
  mathml = mathml.gsub(/\n+/, "\n").strip

  # Fix encoding lỗi
  mathml.encode('UTF-8', invalid: :replace, undef: :replace, replace: '')
end



def process_files_threaded(file_paths)
  results = {}
  mutex = Mutex.new

  chunks = file_paths.each_slice(CHUNK_SIZE).to_a
  work_queue = Queue.new
  chunks.each { |chunk| work_queue << chunk }

  threads = []
  MAX_THREADS.times do
    threads << Thread.new do
      while !work_queue.empty?
        begin
          chunk = work_queue.pop(true)
          chunk.each do |file_path|
            path, result = process_file(file_path)
            mutex.synchronize { results[path] = result }
          end
        rescue ThreadError
          break
        rescue StandardError => e
          STDERR.puts "Thread error: #{e.message}"
        end
      end
    end
  end

  threads.each(&:join)
  results
end



def process_files_sequential(file_paths)
  results = {}
  file_paths.each do |file_path|
    path, result = process_file(file_path)
    results[path] = result
  end
  results
end



begin
  if ARGV.empty?
    puts JSON.generate({})
    exit 0
  end

  file_paths = ARGV.dup
  file_paths = file_paths.uniq.select do |path|
    if File.exist?(path)
      true
    else
      STDERR.puts "Warning: File does not exist: #{path}"
      false
    end
  end

  if file_paths.empty?
    puts JSON.generate({})
    exit 0
  end

  # 👉 Đang dùng sequential cho ổn định
  results = process_files_sequential(file_paths)

  puts JSON.generate(results)

rescue StandardError => e
  error_result = {}
  ARGV.each { |path| error_result[path] = "<!-- ERROR: #{e.message} -->" }
  puts JSON.generate(error_result)
  exit 1

rescue Interrupt
  STDERR.puts "\nInterrupted by user"
  exit 2
end
