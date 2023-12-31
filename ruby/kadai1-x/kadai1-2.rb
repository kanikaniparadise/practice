#!/usr/bin/ruby
# coding: utf-8
#-----各辞書型の構造  tukigoto{:年月　金額}     tukikoumokugoto {:項目{:年月 金額}}     koumokugoto{:項目 金額}
require 'ostruct'

rist =[]
file_name="input.csv"
File.open(file_name){|f|
  f.each_line{|line|
    rist.push(line.split(","))
  }
}
0.step(rist.length-1,1){|i|
  keisann = rist[i][0].split("-")
  rist[i][0]=(keisann[0]<< keisann[1]).to_i
  rist[i][2]=rist[i][2].to_i
}
rist.sort{|x, y| x[0] <=> y[0] }

k = nil
mae = nil
tukigoto={}
tukikoumokugoto = {}
0.step(rist.length-1,1){|i|
  k=rist[i][1]
  if mae!=rist[i][0]
    mae = rist[i][0]
  end
  tukigoto[mae]= tukigoto[mae].to_i+rist[i][2]
  if tukikoumokugoto[mae].nil?
      tukikoumokugoto[mae]={}
  end
  tukikoumokugoto[mae][k]=tukikoumokugoto[mae][k].to_i+rist[i][2] #-----nil避けの.to_iを入れた書き方、koumokugotoの足し算も同様
}
koumokugoto={}
tukikoumokugoto.each{|tuki,utiwake|
  utiwake.each{|koumoku,kingaku|
    koumokugoto[koumoku]=koumokugoto[koumoku].to_i+kingaku
  }
}
#-----ここからは表示
File.open("result.txt","w"){|f|
  tukigoto.each{|tuki,kingaku|
    f.puts(tuki.to_s.slice(0,4)+"年"+tuki.to_s.slice(4,2)+"月の合計金額は"+kingaku.to_s+"円")
    f.puts("その内訳は")
    tukikoumokugoto[tuki].each{|koumoku,kingaku|
      f.puts(koumoku+": "+kingaku.to_s+"円")
    }
  }
  f.puts()
  koumokugoto.each{|koumoku,kingaku|
    f.puts(koumoku+"の"+"合計金額は"+kingaku.to_s+"円")
  }
}
