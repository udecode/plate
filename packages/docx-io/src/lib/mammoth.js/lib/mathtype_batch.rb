 

begin
  require 'json'
  require 'mathtype_to_mathml_plus'

  def clean_mathml(mathml)
    return mathml unless mathml.is_a?(String)
    mathml = mathml.delete("\u2009")
    mathml = mathml.gsub("\u00A0", " ")
    mathml = mathml.gsub(/<mtext>\s*<\/mtext>/, '')
    mathml = mathml.gsub(/\s*display="block"/, '')
    mathml = mathml.gsub(/\s*display="inline"/, '')
    mathml = mathml.gsub(/\n+/, "\n").strip
    mathml.encode('UTF-8', invalid: :replace, undef: :replace, replace: '')
  end

  results = {}

  ARGV.each do |file_path|
    begin
      if !File.exist?(file_path) || !File.readable?(file_path)
        results[file_path] = "<!-- ERROR: File not accessible -->"
        next
      end

      size = File.size(file_path)
      if size == 0
        results[file_path] = "<!-- ERROR: Empty file -->"
        next
      end
      if size > 10_485_760
        results[file_path] = "<!-- ERROR: File too large -->"
        next
      end

      converter = MathTypeToMathMLPlus::Converter.new(file_path)
      mathml = converter.convert
      if mathml.nil? || mathml.strip.empty?
        results[file_path] = "<!-- ERROR: Empty conversion result -->"
        next
      end

      results[file_path] = clean_mathml(mathml)
    rescue => e
      results[file_path] = "<!-- ERROR: #{e.message.to_s.gsub(/[<>]/, '_')} -->"
    end
  end

  puts JSON.generate(results)

rescue LoadError => e
  STDERR.puts "LOAD_ERROR: #{e.message}"
  exit 2
rescue => e
  STDERR.puts "FATAL: #{e.class}: #{e.message}"
  exit 1
end
